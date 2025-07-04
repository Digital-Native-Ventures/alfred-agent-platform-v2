FROM ghcr.io/locotoki/alfred-agent-platform-v2/healthcheck:0.4.0 AS healthcheck

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy application code
COPY . .

# Ensure API directory exists
RUN mkdir -p /app/api

# Create directories and establish symlinks if needed
RUN mkdir -p /app/data/niche_scout /app/data/builder \
    && ln -sf /app/data/niche_scout /app/niche_scout \
    && ln -sf /app/data/builder /app/builder

# Ensure libs directory is properly linked
RUN mkdir -p /app/libs

# Install only core dependencies to avoid conflicts
RUN pip install --no-cache-dir \
    fastapi==0.108.0 \
    uvicorn==0.27.0 \
    pydantic==2.6.0 \
    python-dotenv==1.0.0 \
    structlog==24.1.0 \
    redis==5.0.1 \
    asyncio==3.4.3 \
    asyncpg==0.29.0 \
    httpx==0.26.0 \
    aiohttp==3.9.1 \
    prometheus-client==0.19.0 \
    langchain-core>=0.1.25 \
    google-cloud-pubsub==2.19.0 \
    jinja2==3.1.6

# Create stub implementations directly
RUN mkdir -p /app/libs/a2a_adapter /app/libs/agent_core /app/agents/social_intel

# Create a2a_adapter stub
RUN echo '"""\nStub implementation of A2A Adapter package.\n"""\n\nclass PubSubTransport:\n    def __init__(self, project_id):\n        self.project_id = project_id\n    \n    async def publish(self, topic, message, attributes=None):\n        return "message-id-stub"\n        \n    async def subscribe(self, subscription, callback):\n        pass\n        \nclass SupabaseTransport:\n    def __init__(self, database_url):\n        self.database_url = database_url\n        \n    async def connect(self):\n        pass\n        \n    async def disconnect(self):\n        pass\n        \nclass PolicyMiddleware:\n    def __init__(self, redis_client):\n        self.redis_client = redis_client\n        \n    async def apply_policies(self, envelope):\n        return envelope\n' > /app/libs/a2a_adapter/__init__.py

# Create agent_core stub
RUN echo '"""\nStub implementation of agent_core package.\n"""\n\nfrom fastapi import FastAPI\nimport prometheus_client\n\ndef create_health_app(service_name, version):\n    health_app = FastAPI(\n        title=f"{service_name} Health",\n        description=f"Health checks for {service_name}",\n        version=version,\n    )\n    \n    @health_app.get("/")\n    async def health_check():\n        return {"status": "healthy", "service": service_name, "version": version}\n    \n    @health_app.get("/metrics")\n    async def metrics():\n        return prometheus_client.generate_latest()\n    \n    @health_app.get("/ready")\n    async def readiness_check():\n        return {"status": "ready"}\n    \n    @health_app.get("/live")\n    async def liveness_check():\n        return {"status": "alive"}\n        \n    return health_app\n' > /app/libs/agent_core/__init__.py

# Create SocialIntelAgent stub
RUN echo '"""\nStub implementation of SocialIntelAgent.\n"""\n\nclass SocialIntelAgent:\n    def __init__(self, pubsub_transport, supabase_transport, policy_middleware):\n        self.pubsub_transport = pubsub_transport\n        self.supabase_transport = supabase_transport\n        self.policy_middleware = policy_middleware\n        self.is_running = False\n        self.supported_intents = ["TREND_ANALYSIS", "SOCIAL_MONITOR", "SENTIMENT_ANALYSIS"]\n        \n    async def start(self):\n        self.is_running = True\n        \n    async def stop(self):\n        self.is_running = False\n        \n    async def _analyze_trend(self, request):\n        query = request.get("query", "")\n        return {\n            "query": query,\n            "results": [\n                {"topic": "Topic 1", "popularity": 85, "sentiment": "positive"},\n                {"topic": "Topic 2", "popularity": 65, "sentiment": "neutral"},\n                {"topic": "Topic 3", "popularity": 45, "sentiment": "negative"}\n            ]\n        }\n' > /app/agents/social_intel/agent.py

# Healthcheck is handled by the healthcheck binary

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV QDRANT_URL=http://qdrant:6333

# Expose port
EXPOSE 9000
EXPOSE 9091

# Security: Run as non-root user
USER 1001

# Run the application with healthcheck wrapper
CMD ["healthcheck", "--export-prom", ":9091", "--", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9000"]
