# Technical Architecture Guide

This document will be automatically synced from ChatGPT Canvas.

## System Overview
The Alfred Agent Platform is designed as a modular, microservices-based architecture that enables AI-driven automation and workflow orchestration.

## Core Components

### API Services
- **Architect API**: System design and planning
- **Planner API**: Task breakdown and scheduling  
- **Reviewer API**: Code review and quality checks
- **Summariser API**: Content analysis and reporting

### Infrastructure
- **PostgreSQL**: Primary data store with pgvector for embeddings
- **Redis**: Caching and session storage
- **NATS**: Message queuing and event streaming
- **Docker**: Containerized deployment

### Security
- Container hardening with capability restrictions
- Network isolation with custom Docker networks
- Database security with read-only filesystems where possible

## Data Flow
1. User interactions via UI Console
2. API routing through architect service
3. Task distribution via NATS messaging
4. Results stored in PostgreSQL
5. Real-time updates via Server-Sent Events

This guide is automatically synchronized with the Canvas document and embedded into the AI memory system for contextual assistance.

---

## How to Use This Doc-Sync System

This document is automatically synchronized between multiple platforms to ensure consistency across all development workflows.

### 📋 Canvas (Primary Source)
**ChatGPT Canvas Document ID**: `6858802ef9c48191b3228ade8e4c7174`

The Canvas document serves as the **single source of truth** for this architecture guide.

**To edit in Canvas:**
1. Open ChatGPT and navigate to the Canvas document
2. Make your architectural changes directly in the Canvas editor
3. Changes will be automatically synced to GitHub within 1 hour via the scheduled workflow
4. Manual sync available: Run `gh workflow run doc-sync.yml` for immediate sync

### 🔄 GitHub Integration
**Repository**: `/docs/technical-architecture-guide.md`
**Sync Branch**: `auto/doc-sync`

**Automatic Sync:**
- Runs hourly via GitHub Actions (`.github/workflows/doc-sync.yml`)
- Pulls latest content from Canvas via OpenAI API
- Auto-commits changes with message: "docs: sync architecture guide"
- Embeds content into pgvector for AI memory search

**Manual Triggers:**
```bash
# Trigger immediate sync from Canvas
gh workflow run doc-sync.yml -F branch=main

# Monitor workflow execution
gh run list --workflow=doc-sync.yml
```

### 🖥️ GitHub Web Editing
**⚠️ Important**: Direct edits in GitHub will be **overwritten** by the next Canvas sync.

**For structural changes:**
1. Edit in Canvas first (source of truth)
2. OR: Pause auto-sync, edit in GitHub, then update Canvas manually
3. OR: Use Claude CLI for coordinated edits (recommended)

### 🤖 Claude CLI Integration
**Recommended workflow for developers:**

```bash
# Read current architecture guide
claude read docs/technical-architecture-guide.md

# Make coordinated changes (updates both local and suggests Canvas edits)
claude edit docs/technical-architecture-guide.md

# Test doc-sync workflow
claude doc-sync:test  # Custom alias for sync verification
```

**Claude CLI automatically:**
- Syncs changes with Canvas document when possible
- Validates technical accuracy against codebase
- Suggests architectural improvements
- Maintains consistency with actual implementation

### 🔍 API Access
**Live Documentation Endpoint**: `http://localhost:3000/api/docs/architecture`

```bash
# Fetch current architecture guide via API
curl -s http://localhost:3000/api/docs/architecture

# Verify API serves latest version
curl -sf http://localhost:3000/api/docs/architecture | head -n 5
```

### 🧠 Vector Memory Integration
The architecture guide is automatically embedded into the AI memory system:

**Script**: `scripts/embed_doc.py`
**Storage**: PostgreSQL with pgvector extension
**Usage**: Enables contextual AI assistance with architectural knowledge

```bash
# Manual embedding (if PGVECTOR_URL is configured)
python scripts/embed_doc.py docs/technical-architecture-guide.md
```

### 🔄 Sync Workflows

**Complete Sync Verification:**
```bash
# 1. Trigger sync
gh workflow run doc-sync.yml -F branch=main

# 2. Verify remote matches local
git fetch origin main
git diff origin/main -- docs/technical-architecture-guide.md

# 3. Confirm API serves updated content
curl -sf http://localhost:3000/api/docs/architecture | head -n 10
```

**Troubleshooting:**
- **Sync delays**: Canvas sync runs hourly; manual trigger available
- **Merge conflicts**: Canvas wins; local changes need to be reflected in Canvas
- **API outdated**: Restart architect-api service to reload documentation

### 📝 Best Practices

1. **Canvas First**: Always make primary edits in the Canvas document
2. **Technical Accuracy**: Ensure architectural decisions match actual implementation
3. **Sync Verification**: Use `claude doc-sync:test` to verify end-to-end pipeline
4. **Collaborative Edits**: Coordinate with team when making major architectural changes
5. **Version Control**: Canvas changes are tracked via GitHub commit history

### 🔧 Configuration

**Required Environment Variables:**
```bash
OPENAI_API_KEY=your_openai_api_key          # For Canvas sync
PGVECTOR_URL=your_postgres_connection       # For vector embedding (optional)
```

**GitHub Secrets Required:**
- `OPENAI_API_KEY`: For accessing Canvas document
- `GITHUB_TOKEN`: For auto-committing sync changes
- `PGVECTOR_URL`: For memory embedding (optional)

This automated sync ensures the architecture guide stays current across all platforms while maintaining Canvas as the authoritative source for architectural decisions.

---

## 🚀 Bootstrapping New Sessions

### 🤖 **ChatGPT (Web/Desktop)**
```
Open the Canvas document directly:
Canvas Document ID: 6858802ef9c48191b3228ade8e4c7174

Or paste this prompt:
"Load the technical architecture guide for Alfred Agent Platform. I need to reference the current system design, microservices architecture, and data flow patterns. Please pull up the latest version from our Canvas document ID 6858802ef9c48191b3228ade8e4c7174."
```

### 🖥️ **Claude CLI**
```bash
# Read the current architecture guide
claude read docs/technical-architecture-guide.md

# Or start a new session with architecture context
claude --context docs/technical-architecture-guide.md "Help me understand the current system architecture"

# Load and discuss specific section
claude read docs/technical-architecture-guide.md | claude "Explain the data flow section"
```

### 🎯 **Claude Desktop**
```
1. Open Claude Desktop
2. Upload/reference the local file:
   `/docs/technical-architecture-guide.md`

Or use this prompt:
"I'm working on the Alfred Agent Platform. Please reference our technical architecture guide located at docs/technical-architecture-guide.md. I need context on our microservices design, API structure, and data flow patterns."
```

### 🌐 **Live API Context**
```bash
# Fetch current guide via API and use with any AI tool
curl -s http://localhost:3000/api/docs/architecture > /tmp/architecture.md

# Then reference in any session:
"Here's our current technical architecture guide: [paste content]"
```

### 📱 **Mobile/Quick Reference**
```
Direct GitHub link:
https://raw.githubusercontent.com/Digital-Native-Ventures/alfred-agent-platform-v2/auto/doc-sync/docs/technical-architecture-guide.md

Canvas URL: [Access via ChatGPT Canvas with document ID: 6858802ef9c48191b3228ade8e4c7174]
```

### 🔄 **Session Continuity Commands**
```bash
# Verify you have latest version before starting
git pull origin auto/doc-sync
claude read docs/technical-architecture-guide.md

# Check if API serves current version
curl -sf http://localhost:3000/api/docs/architecture | head -n 5

# Manual sync if needed
gh workflow run doc-sync.yml -F branch=main
```

**Pro Tip**: The architecture guide is automatically embedded in the AI memory system, so once loaded, subsequent questions about the architecture will have context without re-loading the full document.