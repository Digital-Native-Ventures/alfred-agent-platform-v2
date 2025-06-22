FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install fastapi uvicorn PyGithub
CMD ["uvicorn", "reviewer_app:app", "--host", "0.0.0.0", "--port", "8085"]