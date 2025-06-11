# Python Dockerfile
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy all files to /app
COPY . .

# Run Python directly
CMD ["python3", "-u", "main.py"]
