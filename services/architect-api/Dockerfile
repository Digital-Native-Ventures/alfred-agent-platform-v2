FROM python:3.12-slim

WORKDIR /app
COPY services/architect-api/requirements.txt .
RUN pip install -r requirements.txt

COPY services/architect-api/ .
COPY docs/ /app/docs/

EXPOSE 8083
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8083"]