# Python Dockerfile
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy all files to /app
COPY . .

# Run Python code with input redirection
CMD ["sh", "-c", "python3 main.py < input.txt"]
