FROM openjdk:17-jdk-slim  

# Set the working directory inside the container
WORKDIR /app

# Copy the Gradle build output (the JAR file) into the container
# Assuming that your JAR file is located at 'build/libs/'
ARG JAR_FILE=build/libs/NutriPlan-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar

# # Copy application properties files into the container
COPY src/main/resources/application.properties /app/
# COPY src/main/resources/application-prod.yml /app/
# COPY src/main/resources/application-local.yml /app/

# Expose the port that your Spring Boot application will run on
EXPOSE 7000

# Run the JAR file
ENTRYPOINT ["java", "-jar", "/app/app.jar"]