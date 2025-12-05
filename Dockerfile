# 1. 빌드 환경 (Gradle)
FROM gradle:8.5-jdk17 AS builder
WORKDIR /app
COPY . .
# 테스트 제외하고 빌드 (배포 속도 단축)
RUN ./gradlew clean build -x test

# 2. 실행 환경 (OpenJDK)
FROM openjdk:17-jdk-slim
WORKDIR /app
# 빌드된 JAR 파일을 실행 환경으로 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 포트 노출
EXPOSE 8080

# SSL/TLS 설정을 포함한 실행 명령어
ENTRYPOINT ["java", \
    "-Djdk.tls.client.protocols=TLSv1.2", \
    "-Djavax.net.ssl.trustStoreType=JKS", \
    "-Djdk.tls.trustNameService=true", \
    "-jar", "app.jar"]
