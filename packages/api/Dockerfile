FROM python:3.12-slim

WORKDIR /app

RUN adduser --disabled-password --gecos "" appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY start.sh ./start.sh
RUN chmod +x start.sh && chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

CMD ["./start.sh"]
