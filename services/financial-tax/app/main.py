"""Financial Tax Service FastAPI Application"""

from fastapi import FastAPI, HTTPException, Request, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import structlog
import redis
from prometheus_client import Counter, Histogram, Gauge

# Import platform integration clients
from app.clients import (
    supabase_client,
    rag_client,
    AuthMiddleware,
    get_current_user,
    security,
    initialize_clients,
    MIGRATION_MODE,
    SERVICE_VERSION
)

from libs.a2a_adapter import A2AEnvelope, PubSubTransport, SupabaseTransport, PolicyMiddleware
from libs.agent_core.health import create_health_app
from agents.financial_tax import (
    FinancialTaxAgent,
    TAX_CALCULATION,
    FINANCIAL_ANALYSIS,
    TAX_COMPLIANCE_CHECK,
    RATE_SHEET_LOOKUP
)
from agents.financial_tax.models import (
    TaxCalculationRequest,
    FinancialAnalysisRequest,
    ComplianceCheckRequest,
    TaxRateRequest
)

logger = structlog.get_logger(__name__)

# Initialize Prometheus metrics
TASK_COUNTER = Counter(
    'financial_tax_tasks_total',
    'Total tasks processed',
    ['intent', 'status']
)

TASK_DURATION = Histogram(
    'financial_tax_task_duration_seconds',
    'Task processing duration',
    ['intent']
)

API_REQUESTS = Counter(
    'financial_tax_api_requests_total',
    'Total API requests',
    ['endpoint', 'method', 'status']
)

ACTIVE_TASKS = Gauge(
    'financial_tax_active_tasks',
    'Currently processing tasks'
)

# Initialize legacy services
pubsub_transport = PubSubTransport(
    project_id=os.getenv("GCP_PROJECT_ID", "alfred-agent-platform")
)

supabase_transport = SupabaseTransport(
    database_url=os.getenv("DATABASE_URL")
)

redis_client = redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))
policy_middleware = PolicyMiddleware(redis_client)

# Initialize the agent
financial_tax_agent = FinancialTaxAgent(
    pubsub_transport=pubsub_transport,
    supabase_transport=supabase_transport,
    policy_middleware=policy_middleware
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle."""
    # Startup
    # Initialize platform clients
    await initialize_clients()

    # Initialize legacy services
    await supabase_transport.connect()
    await financial_tax_agent.start()
    logger.info("financial_tax_service_started", version=SERVICE_VERSION, mode=MIGRATION_MODE)

    yield

    # Shutdown
    await financial_tax_agent.stop()
    await supabase_transport.disconnect()
    logger.info("financial_tax_service_stopped")

app = FastAPI(
    title="Financial Tax Service",
    description="API for tax calculations, financial analysis, and compliance checking",
    version="1.0.0",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add authentication middleware
app.add_middleware(AuthMiddleware)

# Add health check endpoints
health_app = create_health_app("financial-tax", "1.0.0")
app.mount("/health", health_app)

# API Routes
@app.post("/api/v1/financial-tax/calculate-tax", response_model=None)
async def calculate_tax(
    request: TaxCalculationRequest,
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """Calculate tax liability based on input data."""
    API_REQUESTS.labels(endpoint="calculate-tax", method="POST", status="processing").inc()

    try:
        # Create envelope for the task
        envelope = A2AEnvelope(
            intent=TAX_CALCULATION,
            content=request.dict()
        )

        # Store task in platform Supabase first if in hybrid or platform mode
        if MIGRATION_MODE in ("hybrid", "platform"):
            try:
                # Attempt to store in platform Supabase
                platform_task_id = await supabase_client.store_task(envelope)
                if platform_task_id:
                    envelope.task_id = platform_task_id
                    logger.info("Task stored in platform Supabase", task_id=platform_task_id)
            except Exception as e:
                if MIGRATION_MODE == "platform":
                    # In platform-only mode, raise the exception
                    raise e
                # In hybrid mode, log and continue with legacy storage
                logger.warning("Failed to store task in platform Supabase, using legacy storage",
                              error=str(e))

        # Store task in legacy storage if in legacy or hybrid mode
        if MIGRATION_MODE in ("legacy", "hybrid"):
            legacy_task_id = await supabase_transport.store_task(envelope)
            logger.info("Task stored in legacy storage", task_id=legacy_task_id)

        # Publish task
        message_id = await pubsub_transport.publish_task(envelope)

        # Get tax context if available
        tax_context = []
        try:
            if MIGRATION_MODE in ("hybrid", "platform"):
                # Try to get tax context for this calculation
                jurisdiction = request.jurisdiction.value if hasattr(request.jurisdiction, 'value') else request.jurisdiction
                entity_type = request.entity_type.value if hasattr(request.entity_type, 'value') else request.entity_type

                tax_context = await rag_client.get_tax_context(
                    query=f"Tax calculation for {jurisdiction} {entity_type}",
                    jurisdiction=jurisdiction,
                    tax_year=request.tax_year,
                    entity_type=entity_type
                )
                logger.info(f"Retrieved {len(tax_context)} tax context items")

                # Add context to the agent's working memory if available
                if tax_context and hasattr(financial_tax_agent, 'add_context'):
                    await financial_tax_agent.add_context(envelope.task_id, tax_context)
        except Exception as e:
            logger.warning(f"Failed to retrieve tax context: {str(e)}")

        API_REQUESTS.labels(endpoint="calculate-tax", method="POST", status="success").inc()

        return {
            "status": "accepted",
            "task_id": envelope.task_id,
            "message": "Tax calculation task has been queued",
            "tracking": {
                "task_id": envelope.task_id,
                "message_id": message_id
            }
        }
    except Exception as e:
        API_REQUESTS.labels(endpoint="calculate-tax", method="POST", status="error").inc()
        logger.error("tax_calculation_api_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/financial-tax/analyze-financials", response_model=None)
async def analyze_financials(
    request: FinancialAnalysisRequest,
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """Perform financial analysis on submitted data."""
    API_REQUESTS.labels(endpoint="analyze-financials", method="POST", status="processing").inc()

    try:
        envelope = A2AEnvelope(
            intent=FINANCIAL_ANALYSIS,
            content=request.dict()
        )

        # Store task in platform Supabase first if in hybrid or platform mode
        if MIGRATION_MODE in ("hybrid", "platform"):
            try:
                # Attempt to store in platform Supabase
                platform_task_id = await supabase_client.store_task(envelope)
                if platform_task_id:
                    envelope.task_id = platform_task_id
                    logger.info("Task stored in platform Supabase", task_id=platform_task_id)
            except Exception as e:
                if MIGRATION_MODE == "platform":
                    # In platform-only mode, raise the exception
                    raise e
                # In hybrid mode, log and continue with legacy storage
                logger.warning("Failed to store task in platform Supabase, using legacy storage",
                              error=str(e))

        # Store task in legacy storage if in legacy or hybrid mode
        if MIGRATION_MODE in ("legacy", "hybrid"):
            legacy_task_id = await supabase_transport.store_task(envelope)
            logger.info("Task stored in legacy storage", task_id=legacy_task_id)

        # Publish task
        message_id = await pubsub_transport.publish_task(envelope)

        # Get financial context if available
        financial_context = []
        try:
            if MIGRATION_MODE in ("hybrid", "platform"):
                # Try to get financial context
                statement_type = None
                industry = None

                # Try to extract statement type and industry if available
                if hasattr(request, 'statement_type'):
                    statement_type = request.statement_type
                if hasattr(request, 'industry'):
                    industry = request.industry

                financial_context = await rag_client.get_financial_context(
                    query=f"Financial analysis for {industry or 'general'} {statement_type or 'statements'}",
                    statement_type=statement_type,
                    industry=industry
                )
                logger.info(f"Retrieved {len(financial_context)} financial context items")

                # Add context to the agent's working memory if available
                if financial_context and hasattr(financial_tax_agent, 'add_context'):
                    await financial_tax_agent.add_context(envelope.task_id, financial_context)
        except Exception as e:
            logger.warning(f"Failed to retrieve financial context: {str(e)}")

        API_REQUESTS.labels(endpoint="analyze-financials", method="POST", status="success").inc()

        return {
            "status": "accepted",
            "task_id": envelope.task_id,
            "message": "Financial analysis task has been queued",
            "tracking": {
                "task_id": envelope.task_id,
                "message_id": message_id
            }
        }
    except Exception as e:
        API_REQUESTS.labels(endpoint="analyze-financials", method="POST", status="error").inc()
        logger.error("financial_analysis_api_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/financial-tax/check-compliance", response_model=None)
async def check_compliance(
    request: ComplianceCheckRequest,
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """Check tax compliance for given transactions."""
    API_REQUESTS.labels(endpoint="check-compliance", method="POST", status="processing").inc()

    try:
        envelope = A2AEnvelope(
            intent=TAX_COMPLIANCE_CHECK,
            content=request.dict()
        )

        # Store task in platform Supabase first if in hybrid or platform mode
        if MIGRATION_MODE in ("hybrid", "platform"):
            try:
                # Attempt to store in platform Supabase
                platform_task_id = await supabase_client.store_task(envelope)
                if platform_task_id:
                    envelope.task_id = platform_task_id
                    logger.info("Task stored in platform Supabase", task_id=platform_task_id)
            except Exception as e:
                if MIGRATION_MODE == "platform":
                    # In platform-only mode, raise the exception
                    raise e
                # In hybrid mode, log and continue with legacy storage
                logger.warning("Failed to store task in platform Supabase, using legacy storage",
                              error=str(e))

        # Store task in legacy storage if in legacy or hybrid mode
        if MIGRATION_MODE in ("legacy", "hybrid"):
            legacy_task_id = await supabase_transport.store_task(envelope)
            logger.info("Task stored in legacy storage", task_id=legacy_task_id)

        # Publish task
        message_id = await pubsub_transport.publish_task(envelope)

        # Get regulatory context if available
        regulatory_context = []
        try:
            if MIGRATION_MODE in ("hybrid", "platform"):
                # Try to extract regulatory information if available
                jurisdictions = request.jurisdictions if hasattr(request, 'jurisdictions') else None
                primary_jurisdiction = jurisdictions[0] if jurisdictions else None

                if primary_jurisdiction:
                    regulation_type = "tax"
                    country = primary_jurisdiction.split("-")[0] if "-" in primary_jurisdiction else primary_jurisdiction

                    regulatory_context = await rag_client.get_regulatory_context(
                        query=f"Tax compliance regulations for {primary_jurisdiction}",
                        regulation_type=regulation_type,
                        country=country
                    )
                    logger.info(f"Retrieved {len(regulatory_context)} regulatory context items")

                    # Add context to the agent's working memory if available
                    if regulatory_context and hasattr(financial_tax_agent, 'add_context'):
                        await financial_tax_agent.add_context(envelope.task_id, regulatory_context)
        except Exception as e:
            logger.warning(f"Failed to retrieve regulatory context: {str(e)}")

        API_REQUESTS.labels(endpoint="check-compliance", method="POST", status="success").inc()

        return {
            "status": "accepted",
            "task_id": envelope.task_id,
            "message": "Compliance check task has been queued",
            "tracking": {
                "task_id": envelope.task_id,
                "message_id": message_id
            }
        }
    except Exception as e:
        API_REQUESTS.labels(endpoint="check-compliance", method="POST", status="error").inc()
        logger.error("compliance_check_api_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/financial-tax/tax-rates/{jurisdiction}", response_model=None)
async def get_tax_rates(
    jurisdiction: str,
    tax_year: int = None,
    entity_type: str = None,
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """Retrieve tax rates for specified jurisdiction."""
    API_REQUESTS.labels(endpoint="tax-rates", method="GET", status="processing").inc()

    try:
        # Create request object
        rate_request = TaxRateRequest(
            jurisdiction=jurisdiction,
            tax_year=tax_year or 2024,
            entity_type=entity_type or "individual"
        )

        envelope = A2AEnvelope(
            intent=RATE_SHEET_LOOKUP,
            content=rate_request.dict()
        )

        # Store task in platform Supabase first if in hybrid or platform mode
        if MIGRATION_MODE in ("hybrid", "platform"):
            try:
                # Attempt to store in platform Supabase
                platform_task_id = await supabase_client.store_task(envelope)
                if platform_task_id:
                    envelope.task_id = platform_task_id
                    logger.info("Task stored in platform Supabase", task_id=platform_task_id)
            except Exception as e:
                if MIGRATION_MODE == "platform":
                    # In platform-only mode, raise the exception
                    raise e
                # In hybrid mode, log and continue with legacy storage
                logger.warning("Failed to store task in platform Supabase, using legacy storage",
                              error=str(e))

        # Store task in legacy storage if in legacy or hybrid mode
        if MIGRATION_MODE in ("legacy", "hybrid"):
            legacy_task_id = await supabase_transport.store_task(envelope)
            logger.info("Task stored in legacy storage", task_id=legacy_task_id)

        # Publish task
        message_id = await pubsub_transport.publish_task(envelope)

        # Get tax context for rates if available
        tax_rates_context = []
        try:
            if MIGRATION_MODE in ("hybrid", "platform"):
                tax_rates_context = await rag_client.get_tax_context(
                    query=f"Tax rates for {jurisdiction} {entity_type or 'individual'} {tax_year or 2024}",
                    jurisdiction=jurisdiction,
                    tax_year=tax_year or 2024,
                    entity_type=entity_type or "individual"
                )
                logger.info(f"Retrieved {len(tax_rates_context)} tax rate context items")

                # Add context to the agent's working memory if available
                if tax_rates_context and hasattr(financial_tax_agent, 'add_context'):
                    await financial_tax_agent.add_context(envelope.task_id, tax_rates_context)
        except Exception as e:
            logger.warning(f"Failed to retrieve tax rate context: {str(e)}")

        API_REQUESTS.labels(endpoint="tax-rates", method="GET", status="success").inc()

        return {
            "status": "accepted",
            "task_id": envelope.task_id,
            "message": "Tax rate lookup task has been queued",
            "tracking": {
                "task_id": envelope.task_id,
                "message_id": message_id
            }
        }
    except Exception as e:
        API_REQUESTS.labels(endpoint="tax-rates", method="GET", status="error").inc()
        logger.error("tax_rate_lookup_api_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/financial-tax/task/{task_id}", response_model=None)
async def get_task_status(
    task_id: str,
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """Get status of a specific task."""
    try:
        # Try platform Supabase first if in hybrid or platform mode
        task_status = None
        platform_status_attempted = False

        if MIGRATION_MODE in ("hybrid", "platform"):
            try:
                platform_status_attempted = True
                task_status = await supabase_client.get_task_status(task_id)

                if task_status:
                    logger.info("Task status retrieved from platform Supabase", task_id=task_id)
                    return task_status
                elif MIGRATION_MODE == "platform":
                    # In platform-only mode, if not found, return 404
                    raise HTTPException(status_code=404, detail="Task not found")
            except HTTPException as he:
                # If it's an HTTPException, re-raise it immediately
                if MIGRATION_MODE == "platform":
                    raise he
                logger.warning("Failed to get task status from platform Supabase",
                              error=str(he), task_id=task_id)
            except Exception as e:
                # For other exceptions, log and continue with legacy if in hybrid mode
                if MIGRATION_MODE == "platform":
                    raise e
                logger.warning("Error retrieving task status from platform Supabase",
                              error=str(e), task_id=task_id)

        # Fall back to legacy storage if necessary
        if MIGRATION_MODE in ("legacy", "hybrid") and not task_status:
            try:
                task_status = await supabase_transport.get_task_status(task_id)

                if task_status:
                    logger.info("Task status retrieved from legacy storage", task_id=task_id)
                    return task_status
            except Exception as e:
                logger.warning("Error retrieving task status from legacy storage",
                              error=str(e), task_id=task_id)

        # If we get here and task_status is still None, the task was not found
        if not task_status:
            raise HTTPException(status_code=404, detail="Task not found")

        return task_status
    except HTTPException:
        raise
    except Exception as e:
        logger.error("task_status_api_error", error=str(e), task_id=task_id)
        raise HTTPException(status_code=500, detail=str(e))


# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions."""
    return {"error": exc.detail, "status_code": exc.status_code}


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions."""
    logger.error("unhandled_exception", error=str(exc))
    return {"error": "Internal server error", "status_code": 500}
