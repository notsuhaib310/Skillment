# Java Dockerfile
FROM openjdk:17-slim

# Set working directory
WORKDIR /app

# Copy all code to /app
COPY . .

# Compile the Java code
RUN javac Main.java

# Run Java with input redirection
CMD ["sh", "-c", "java Main < input.txt"]
