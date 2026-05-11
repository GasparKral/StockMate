FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# 1. Copiar solo archivos de configuración primero (mejor cache)
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .

# Dar permisos al wrapper
RUN chmod +x gradlew

# Descargar dependencias (se cachea)
RUN ./gradlew dependencies --no-daemon

# 2. Ahora copiar el código fuente
COPY src src

# 3. Build real
RUN ./gradlew bootJar -x test --no-daemon

# Runtime más liviano
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]