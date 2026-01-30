FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install fastapi uvicorn loguru numpy scipy dependency-injector httpx pydantic
CMD ["python", "-m", "quantum_ethical_states.main"]
