# First stage: Get the healthcheck binary
FROM gcr.io/distroless/static-debian12:nonroot AS healthcheck
WORKDIR /app
COPY --from=ghcr.io/locotoki/alfred-agent-platform-v2/healthcheck:latest /usr/local/bin/healthcheck /usr/local/bin/healthcheck

# Main application stage
FROM python:3.11-slim AS app

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ app/

# Install healthcheck binary from first stage
COPY --from=healthcheck /usr/local/bin/healthcheck /usr/local/bin/healthcheck

# Set up health check environment variables
ENV HEALTH_CHECK_PORT=8080
ENV HEALTH_CHECK_PATH=/health
ENV HEALTH_CHECK_INTERVAL=30s
ENV METRICS_EXPORTER_PORT=9091

# Set healthcheck command with standard parameters
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["/usr/local/bin/healthcheck", \
         "--export-prom", ":${METRICS_EXPORTER_PORT}", \
         "--interval", "${HEALTH_CHECK_INTERVAL}", \
         "--port", "${HEALTH_CHECK_PORT}", \
         "--path", "${HEALTH_CHECK_PATH}"]

# Copy and prepare the entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=8080

# Expose ports
EXPOSE 8080
EXPOSE 9091

# Use the entrypoint script to run the application
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]

# Security: Run as non-root user
USER 1001
