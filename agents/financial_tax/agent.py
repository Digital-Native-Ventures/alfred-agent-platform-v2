"""Financial Tax Agent implementation"""

from typing import Any, Dict

import structlog
from langchain_openai import ChatOpenAI
from langgraph.graph import END, Graph

from libs.a2a_adapter import A2AEnvelope
from libs.agent_core import BaseAgent

from .chains import (ComplianceCheckChain, FinancialAnalysisChain,
                     RateLookupChain, TaxCalculationChain)
from .models import (ComplianceCheckRequest, FinancialAnalysisRequest,
                     TaxCalculationRequest, TaxRateRequest)

logger = structlog.get_logger(__name__)


class FinancialTaxAgent(BaseAgent):
    """Agent for financial and tax analysis tasks"""

    def __init__(self, *args, **kwargs):
        super().__init__(
            name="financial-tax-agent",
            version="1.0.0",
            supported_intents=[
                "TAX_CALCULATION",
                "FINANCIAL_ANALYSIS",
                "TAX_COMPLIANCE_CHECK",
                "RATE_SHEET_LOOKUP",
            ],
            *args,
            **kwargs,
        )
        self.setup_chains()
        self.setup_graph()

    def setup_chains(self):
        """Initialize LangChain configurations for each intent"""
        llm = ChatOpenAI(
            temperature=0,
            model="gpt-4",
            openai_api_key="sk-mock-key-for-development-only",
        )

        self.tax_calc_chain = TaxCalculationChain(llm)
        self.analysis_chain = FinancialAnalysisChain(llm)
        self.compliance_chain = ComplianceCheckChain(llm)
        self.rate_lookup_chain = RateLookupChain(llm)

    def setup_graph(self):
        """Setup LangGraph for complex workflow orchestration"""
        self.workflow_graph = Graph()

        # Add nodes for different processing steps
        self.workflow_graph.add_node("parse_request", self._parse_request)
        self.workflow_graph.add_node("validate_data", self._validate_data)
        self.workflow_graph.add_node(
            "process_tax_calculation", self._process_tax_calculation
        )
        self.workflow_graph.add_node(
            "process_financial_analysis", self._process_financial_analysis
        )
        self.workflow_graph.add_node(
            "process_compliance_check", self._process_compliance_check
        )
        self.workflow_graph.add_node("process_rate_lookup", self._process_rate_lookup)
        self.workflow_graph.add_node("format_response", self._format_response)

        # Add edges for workflow
        self.workflow_graph.add_edge("parse_request", "validate_data")

        # Add conditional edges based on intent
        self.workflow_graph.add_conditional_edges(
            "validate_data",
            self._route_by_intent,
            {
                "tax_calculation": "process_tax_calculation",
                "financial_analysis": "process_financial_analysis",
                "compliance_check": "process_compliance_check",
                "rate_lookup": "process_rate_lookup",
            },
        )

        # All processing nodes lead to format_response
        self.workflow_graph.add_edge("process_tax_calculation", "format_response")
        self.workflow_graph.add_edge("process_financial_analysis", "format_response")
        self.workflow_graph.add_edge("process_compliance_check", "format_response")
        self.workflow_graph.add_edge("process_rate_lookup", "format_response")

        # format_response leads to END
        self.workflow_graph.add_edge("format_response", END)

        # Set entry point
        self.workflow_graph.set_entry_point("parse_request")

        # Compile the graph
        self.workflow = self.workflow_graph.compile()

    async def process_task(self, envelope: A2AEnvelope) -> Dict[str, Any]:
        """Process a financial/tax task"""
        logger.info(
            "processing_financial_tax_task",
            task_id=envelope.task_id,
            intent=envelope.intent,
        )

        try:
            # Execute the workflow
            result = await selfworkflow.ainvoke(
                {
                    "envelope": envelope,
                    "intent": envelope.intent,
                    "content": envelope.content,
                }
            )

            return result.get("response", {})

        except Exception as e:
            logger.error(
                "financial_tax_processing_failed",
                error=str(e),
                task_id=envelope.task_id,
                intent=envelope.intent,
            )
            raise

    # Workflow node implementations
    async def _parse_request(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Parse the incoming request"""
        state["parsed_content"] = state["content"]
        return state

    async def _validate_data(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Validate the request data"""
        # Add validation logic here
        state["is_valid"] = True
        return state

    def _route_by_intent(self, state: Dict[str, Any]) -> str:
        """Route to appropriate processor based on intent"""
        intent = state["intent"]
        if intent == "TAX_CALCULATION":
            return "tax_calculation"
        elif intent == "FINANCIAL_ANALYSIS":
            return "financial_analysis"
        elif intent == "TAX_COMPLIANCE_CHECK":
            return "compliance_check"
        elif intent == "RATE_SHEET_LOOKUP":
            return "rate_lookup"
        else:
            raise ValueError(f"Unsupported intent: {intent}")

    async def _process_tax_calculation(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Process tax calculation request"""
        request = TaxCalculationRequest(**state["parsed_content"])
        result = await selftax_calc_chain.calculate(request)
        state["result"] = result.dict()
        return state

    async def _process_financial_analysis(
        self, state: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process financial analysis request"""
        request = FinancialAnalysisRequest(**state["parsed_content"])
        result = await selfanalysis_chain.analyze(request)
        state["result"] = result.dict()
        return state

    async def _process_compliance_check(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Process compliance check request"""
        request = ComplianceCheckRequest(**state["parsed_content"])
        result = await selfcompliance_chain.check_compliance(request)
        state["result"] = result.dict()
        return state

    async def _process_rate_lookup(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Process rate lookup request"""
        request = TaxRateRequest(**state["parsed_content"])
        result = await selfrate_lookup_chain.lookup_rates(request)
        state["result"] = result.dict()
        return state

    async def _format_response(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Format the response for output"""
        state["response"] = {
            "status": "success",
            "intent": state["intent"],
            "result": state["result"],
        }
        return state

    # Specific handler methods for each intent
    async def _handle_tax_calculation(self, envelope: A2AEnvelope) -> Dict[str, Any]:
        """Handle tax calculation requests"""
        request = TaxCalculationRequest(**envelope.content)
        result = await selftax_calc_chain.calculate(request)

        return {
            "status": "success",
            "calculation": result.dict(),
            "summary": {
                "gross_income": result.gross_income,
                "taxable_income": result.taxable_income,
                "tax_liability": result.tax_liability,
                "net_tax_due": result.net_tax_due,
                "effective_rate": result.effective_tax_rate,
            },
        }

    async def _handle_financial_analysis(self, envelope: A2AEnvelope) -> Dict[str, Any]:
        """Handle financial analysis requests"""
        request = FinancialAnalysisRequest(**envelope.content)
        result = await selfanalysis_chain.analyze(request)

        return {
            "status": "success",
            "analysis": result.dict(),
            "summary": result.summary,
            "key_insights": result.insights[:5],  # Top 5 insights
        }

    async def _handle_compliance_check(self, envelope: A2AEnvelope) -> Dict[str, Any]:
        """Handle compliance check requests"""
        request = ComplianceCheckRequest(**envelope.content)
        result = await selfcompliance_chain.check_compliance(request)

        return {
            "status": "success",
            "compliance_result": result.dict(),
            "overall_status": result.compliance_status,
            "risk_level": result.risk_level,
            "critical_issues": [
                issue
                for issue in result.issues_found
                if issue.get("severity") == "critical"
            ],
        }

    async def _handle_rate_lookup(self, envelope: A2AEnvelope) -> Dict[str, Any]:
        """Handle tax rate lookup requests"""
        request = TaxRateRequest(**envelope.content)
        result = await selfrate_lookup_chain.lookup_rates(request)

        return {
            "status": "success",
            "rate_info": result.dict(),
            "summary": {
                "jurisdiction": result.jurisdiction,
                "tax_year": result.tax_year,
                "entity_type": result.entity_type,
                "bracket_count": len(result.tax_brackets),
            },
        }
