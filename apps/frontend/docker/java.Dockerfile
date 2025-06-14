FROM openjdk:17-slim

WORKDIR /app

# Copy the Java file
COPY Main.java .

# Compile the Java file
RUN javac Main.java

# Run the compiled Java program
CMD ["java", "Main"] 