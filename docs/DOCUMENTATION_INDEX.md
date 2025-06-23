# Alfred Agent Platform v2 - Documentation Index

*Last Updated: 2025-06-23*

## 🚀 Quick Start

**Get the platform running in under 2 minutes:**
```bash
# One-command startup
./scripts/quick_restore.sh

# Manual startup
docker compose --env-file .env.local up -d
```

## 📚 Documentation Library

### **Essential Guides**
| Document | Purpose | Use When |
|----------|---------|----------|
| [`SETUP_AND_OPERATIONS_GUIDE.md`](SETUP_AND_OPERATIONS_GUIDE.md) | **Complete setup & ops manual** | Setting up, troubleshooting, daily ops |
| [`AI_WORKFLOW_IMPLEMENTATIONS_COMPLETE.md`](AI_WORKFLOW_IMPLEMENTATIONS_COMPLETE.md) | **Full AI agent & workflow catalog** | Understanding capabilities, development |
| [`technical-architecture-guide.md`](technical-architecture-guide.md) | **System architecture overview** | Architecture decisions, Canvas sync |

### **Reference Documents**
| Document | Purpose | Use When |
|----------|---------|----------|
| [`technical-guide-snapshot-2025-06-21.md`](technical-guide-snapshot-2025-06-21.md) | **Historical reference** | Understanding evolution, baseline |
| [`CLAUDE.md`](../CLAUDE.md) | **Claude Code role guide** | Development workflow, project conventions |

## 🎯 Common Tasks

### **Getting Started**
1. **First Time Setup**: Read `SETUP_AND_OPERATIONS_GUIDE.md` → Quick Start section
2. **Run Platform**: `./scripts/quick_restore.sh`
3. **Verify Working**: Visit http://localhost:3000

### **Development**
1. **Understand Architecture**: `technical-architecture-guide.md`
2. **See All AI Capabilities**: `AI_WORKFLOW_IMPLEMENTATIONS_COMPLETE.md`
3. **Follow Conventions**: `../CLAUDE.md`

### **Operations**
1. **Daily Startup**: `./scripts/quick_restore.sh`
2. **Troubleshooting**: `SETUP_AND_OPERATIONS_GUIDE.md` → Troubleshooting section
3. **Monitoring**: Use diagnostic scripts in operations guide

### **Reference**
1. **API Endpoints**: http://localhost:8083/docs (when running)
2. **Historical Context**: `technical-guide-snapshot-2025-06-21.md`
3. **Complete Feature List**: `AI_WORKFLOW_IMPLEMENTATIONS_COMPLETE.md`

## 🔧 Platform Status

**Current State (2025-06-23)**:
- ✅ 10+ AI Agents operational
- ✅ All 4 core APIs healthy
- ✅ LangGraph + LangChain integrated
- ✅ React UI with chat interface
- ✅ Vector memory with pgvector
- ✅ Complete workflow automation

**Services Running**:
- architect-api (8083) - Chat, planning, memory
- planner-api (8084) - PRD automation  
- reviewer-api (8085) - PR reviews
- summariser-api (8086) - Content generation
- new-ui (3000) - React console
- n8n (5678) - Workflow automation

## 📞 Quick Help

**Platform Won't Start?**
```bash
# Check environment
ls -la .env.local

# View logs
docker compose --env-file .env.local logs

# Start specific service
docker compose --env-file .env.local up -d architect-api
```

**Need to Understand Capabilities?**
- See `AI_WORKFLOW_IMPLEMENTATIONS_COMPLETE.md` for complete catalog
- 6+ specialized AI agents with different purposes
- LangGraph workflows for complex automation
- GPT-4 powered chat and reasoning

**Want to Develop?**
- Read `CLAUDE.md` for project conventions
- Follow namespace structure (`alfred.*`)
- Use provided diagnostic scripts for testing

## 🎉 Success Indicators

Platform is working correctly when:
- ✅ All health checks return `{"status":"ok"}`
- ✅ Chat responds to messages
- ✅ UI loads at http://localhost:3000
- ✅ API docs available at http://localhost:8083/docs

**Quick Test**:
```bash
curl -X POST http://localhost:8083/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello Alfred"}' | grep "ok"
```

---

*This documentation ensures the Alfred Agent Platform v2 can be understood, operated, and extended by any team member.*