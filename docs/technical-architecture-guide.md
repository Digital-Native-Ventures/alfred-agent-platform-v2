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