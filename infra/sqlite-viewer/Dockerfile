FROM python:3.12-alpine

WORKDIR /app
COPY viewer.py /app/viewer.py
RUN python -m py_compile /app/viewer.py \
    && adduser -D -H -u 10001 viewer \
    && chown -R 10001:10001 /app \
    && rm -rf /app/__pycache__

USER 10001:10001
EXPOSE 8080
CMD ["python", "-B", "/app/viewer.py"]
