# ADR-003: Architect Chat Stream

## Context
Frontend now consumes Server-Sent Events from `/api/chat/stream`.

## Decision
* SSE chosen over WebSockets for simplicity.
* Keep-alive `event: ping` every 25 s to avoid proxy idle-timeout.
* Auth via JWT in `Authorization` header.

## Consequences
* Client auto-reconnect with exponential back-off.
* All backend endpoints must respect CORS `Access-Control-Allow-Origin`.

EOF < /dev/null
