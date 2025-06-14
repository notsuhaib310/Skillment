# Java Dockerfile
FROM openjdk:17-slim

# Set working directory
WORKDIR /app

# Copy all code to /app
COPY . .

# Create a shell script to run Java
RUN echo '#!/bin/sh\njavac *.java\njava "$@"' > /app/run.sh && chmod +x /app/run.sh

# Run the shell script
ENTRYPOINT ["/app/run.sh"]
