# Alfred Agent Platform v2 - Setup & Operations Guide

*Last Updated: 2025-06-23*  
*Status: Production Ready ✅*

## Quick Start Commands

### 🚀 **One-Command Startup**
```bash
# Start all services with proper configuration
docker compose --env-file .env.local up -d

# Verify all systems operational
curl -s http://localhost:8083/healthz && echo " ✅ architect-api"
curl -s http://localhost:8084/healthz && echo " ✅ planner-api" 
curl -s http://localhost:8085/healthz && echo " ✅ reviewer-api"
curl -s http://localhost:8086/healthz && echo " ✅ summariser-api"
```

### 🔍 **Quick Diagnostics**
```bash
# Copy-paste diagnostic script
echo "=== Alfred v2 Platform Status ===" && echo
echo "1) API Health Checks:"
for port in 8083 8084 8085 8086; do 
  echo -n "Service :$port → "
  curl -s http://localhost:$port/healthz 2>/dev/null | grep -o '"status":"ok"' && echo "✅" || echo "❌"
done
echo
echo "2) Chat System Test:"
curl -s -X POST http://localhost:8083/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Status check"}' | grep -q '"status":"ok"' && echo "✅ Chat working" || echo "❌ Chat issues"
echo
echo "3) Service Count:"
docker compose --env-file .env.local ps --services --filter "status=running" | wc -l | xargs echo "Running services:"
echo
echo "4) Access Points:"
echo "- UI Console: http://localhost:3000"
echo "- API Docs: http://localhost:8083/docs" 
echo "- n8n Workflows: http://localhost:5678"
```

---

## System Overview

### **Architecture**
```
UI Console (3000) → API Gateway → AI Agents → Infrastructure
     ↓                 ↓             ↓           ↓
  React App      FastAPI Services  LangGraph   PostgreSQL
                                  LangChain     Redis
                                               NATS
```

### **AI Workflow Capabilities**
- **10+ Specialized Agents**: Financial, Legal, Alert Explanation, Remediation
- **LangGraph State Machines**: Complex workflow orchestration
- **LangChain Integration**: Document analysis, compliance checking
- **GPT-4 Powered**: Chat, reasoning, content generation
- **Vector Memory**: Context-aware assistance with pgvector
- **Real-time Features**: SSE streaming, live updates

---

## Environment Configuration

### **Required Environment File**: `.env.local`

**Critical Variables**:
```bash
# Database (URL-encoded password for special characters)
PG_DSN=postgresql://postgres:VnVSL%2FoHOKNYk4qf9ewYQAURIug7LVYO@db-postgres:5432/postgres
POSTGRES_PASSWORD=VnVSL/oHOKNYk4qf9ewYQAURIug7LVYO

# AI Services (OpenAI API key with real project key)
OPENAI_API_KEY=sk-proj-[your-actual-key-here]
ALFRED_OPENAI_API_KEY=sk-proj-[your-actual-key-here]

# External Integrations (placeholders work for basic operation)
GITHUB_TOKEN=ghp_placeholder_token_for_testing
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/placeholder/webhook/url
ALFRED_GDOC_ID=placeholder_google_doc_id

# Infrastructure
DATABASE_URL=postgresql://postgres:VnVSL/oHOKNYk4qf9ewYQAURIug7LVYO@db-postgres:5432/postgres
REDIS_URL=redis://redis:6379
```

**Common Issues & Solutions**:

| Issue | Symptom | Solution |
|-------|---------|----------|
| DB Connection Error | `invalid integer value "VnVSL"` | URL-encode password: `/` → `%2F` |
| Chat Not Working | 404 or 500 errors | Verify OPENAI_API_KEY is set correctly |
| Services Won't Start | Container restart loops | Check docker logs for missing env vars |

---

## Service Endpoints

### **Core APIs**
| Service | Port | Health Check | Purpose | Documentation |
|---------|------|--------------|---------|---------------|
| architect-api | 8083 | `/healthz` | Chat, planning, memory | `/docs` |
| planner-api | 8084 | `/healthz` | PRD → GitHub automation | `/docs` |
| reviewer-api | 8085 | `/healthz` | PR review automation | `/docs` |
| summariser-api | 8086 | `/healthz` | Content generation | `/docs` |

### **Key Functionality**
```bash
# Chat with AI architect
curl -X POST http://localhost:8083/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Help me design a microservice"}'

# Get phase documentation  
curl http://localhost:8083/plan/8

# Stream chat responses
curl http://localhost:8083/chat/stream

# Health check all services
for port in 8083 8084 8085 8086; do
  curl http://localhost:$port/healthz
done
```

### **Infrastructure Services**
| Service | Port | Purpose | Access |
|---------|------|---------|--------|
| new-ui | 3000 | React console | http://localhost:3000 |
| n8n | 5678 | Workflow automation | http://localhost:5678 |
| db-postgres | 5432 | Primary database | Internal |
| redis | 6379 | Cache/sessions | Internal |
| nats | 4222 | Message queue | Internal |

---

## Troubleshooting Playbook

### **Startup Issues**

**Problem**: Services fail to start
```bash
# Check what's running
docker compose --env-file .env.local ps

# View logs for specific service
docker compose --env-file .env.local logs [service-name]

# Restart all services
docker compose --env-file .env.local down
docker compose --env-file .env.local up -d
```

**Problem**: Database connection failures
```bash
# Check postgres is running
docker compose --env-file .env.local ps db-postgres

# Test connection manually
docker exec -it alfred-agent-platform-v2-db-postgres-1 \
  psql -U postgres -d postgres -c "SELECT version();"

# Verify PG_DSN format (must be URL-encoded)
echo $PG_DSN
```

### **API Issues**

**Problem**: 404 errors on endpoints
```bash
# Check available endpoints
curl http://localhost:8083/openapi.json | grep '"path"'

# Try alternative health endpoints
curl http://localhost:8083/health    # might be /health not /healthz
curl http://localhost:8083/healthz   # or /healthz
```

**Problem**: Chat not responding
```bash
# Verify OpenAI key is set
docker compose --env-file .env.local exec architect-api env | grep OPENAI

# Test simple chat
curl -X POST http://localhost:8083/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

### **Performance Issues**

**Problem**: Slow responses
```bash
# Check container resources
docker stats

# Check database performance
docker compose --env-file .env.local exec db-postgres \
  psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

---

## Operational Procedures

### **Daily Startup Routine**
1. **Start Platform**: `docker compose --env-file .env.local up -d`
2. **Run Diagnostics**: Use quick diagnostic script above
3. **Verify Access**: Check UI at http://localhost:3000
4. **Test Chat**: Send test message to architect-api

### **Development Workflow**
1. **Make Changes**: Edit code in respective service directories
2. **Rebuild Service**: `docker compose --env-file .env.local build [service]`
3. **Restart**: `docker compose --env-file .env.local up -d [service]`
4. **Test**: Run diagnostic commands

### **Backup Procedures**
```bash
# Backup database
docker compose --env-file .env.local exec db-postgres \
  pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql

# Backup environment config
cp .env.local .env.backup.$(date +%Y%m%d)

# Export docker images
docker save alfred-agent-platform-v2-architect-api > architect-api.tar
```

### **Recovery Procedures**
```bash
# Quick recovery from backup
docker compose --env-file .env.local down
cp .env.backup.YYYYMMDD .env.local
docker compose --env-file .env.local up -d

# Database restore
cat backup_YYYYMMDD.sql | docker compose --env-file .env.local exec -T db-postgres \
  psql -U postgres postgres
```

---

## Monitoring & Observability

### **Health Monitoring Script**
Save as `monitor_alfred.sh`:
```bash
#!/bin/bash
while true; do
  clear
  echo "=== Alfred Platform Monitor $(date) ==="
  echo
  
  # Service health
  for port in 8083 8084 8085 8086; do 
    if curl -s http://localhost:$port/healthz > /dev/null 2>&1; then
      echo "✅ Service on port $port"
    else
      echo "❌ Service on port $port DOWN"
    fi
  done
  
  # Container status
  echo
  echo "Container Status:"
  docker compose --env-file .env.local ps --format "table {{.Service}}\t{{.Status}}"
  
  sleep 30
done
```

### **Log Aggregation**
```bash
# View all service logs
docker compose --env-file .env.local logs -f

# View specific service logs
docker compose --env-file .env.local logs -f architect-api

# Search logs for errors
docker compose --env-file .env.local logs | grep -i error
```

---

## Security Considerations

### **Environment Security**
- ✅ Database password is auto-generated (secure)
- ⚠️ OpenAI API key must be real for production
- ⚠️ GitHub token should be real for PR automation
- ⚠️ Slack webhook should be real for notifications

### **Network Security**
- Services communicate via internal Docker network
- Only necessary ports exposed to host
- Database not directly accessible from outside

### **Access Control**
- n8n admin interface: http://localhost:5678
- API documentation: http://localhost:8083/docs
- UI console: http://localhost:3000

---

## Integration Points

### **External Services**
- **OpenAI**: GPT-4 for AI capabilities
- **GitHub**: PR/Issue automation (optional)
- **Slack**: Notifications (optional)
- **Google Docs**: Documentation sync (optional)

### **Internal Communication**
- **NATS**: Message queue for agent communication
- **Redis**: Session storage and caching
- **PostgreSQL**: Primary data storage with vector capabilities

---

## Version Information

**Current State (2025-06-23)**:
- **Branch**: `feat/ui-shell-mvp`
- **Docker Images**: Built from latest source
- **Environment**: `.env.local` with working configuration
- **Status**: All services operational

**Key Files**:
- `docs/AI_WORKFLOW_IMPLEMENTATIONS_COMPLETE.md`: Comprehensive technical guide
- `docs/technical-architecture-guide.md`: System architecture
- `docs/technical-guide-snapshot-2025-06-21.md`: Historical reference
- `.env.local`: Working environment configuration

**Documentation**:
- Full AI agent catalog: See AI_WORKFLOW_IMPLEMENTATIONS_COMPLETE.md
- 10+ specialized agents with LangGraph/LangChain
- Complete development timeline and features

---

## Quick Reference Commands

```bash
# Essential commands for daily use

# Start everything
docker compose --env-file .env.local up -d

# Check status
docker compose --env-file .env.local ps

# View logs
docker compose --env-file .env.local logs -f

# Stop everything
docker compose --env-file .env.local down

# Restart specific service
docker compose --env-file .env.local restart architect-api

# Run diagnostics
curl http://localhost:8083/healthz
```

**Emergency Contact Points**:
- Platform documentation: `docs/` directory
- Service logs: `docker compose logs [service]`
- Environment config: `.env.local`
- Quick diagnostics: Copy-paste script in this document

---

*This document ensures the Alfred Agent Platform v2 can be quickly restored to full operational status by any team member.*