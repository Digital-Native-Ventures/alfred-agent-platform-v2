FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install fastapi uvicorn psycopg2-binary
CMD ["uvicorn", "cost_api:app", "--host", "0.0.0.0", "--port", "8082"]