# Airline Management System (Microservices)

A scalable, multi-module microservice-based airline management platform built with **Java 17**, **Spring Boot**, **Spring Security**, **JJWT**, **Spring Data JPA**, **Spring Cache**, and **PostgreSQL**.

---

## 🏗 System Architecture & Modules

The repository is organized as a Maven multi-module project:

```
airline-system/
├── pom.xml                                   # Root Reactor Parent POM
├── microservice/
│   ├── pom.xml                               # Microservices Parent Aggregator
│   ├── common-lib/                           # Shared DTOs, Embeddables, Enums & Utilities
│   │   ├── src/main/java/com/noir/
│   │   │   ├── embeddable/                   # Address, GeoCode
│   │   │   ├── enums/                        # UserRole (ROLE_SYSTEM_ADMIN, ROLE_USER, ROLE_AIRLINE_OWNER)
│   │   │   └── payload/
│   │   │       ├── dto/                      # UserDTO
│   │   │       ├── request/                  # CityRequest, AirportRequest, LoginRequest
│   │   │       └── response/                 # CityResponse, AirportResponse, ApiResponse, AuthResponse
│   ├── cloud/                                # Cloud Infrastructure (Config / Gateway)
│   └── services/                             # Business Services Aggregator
│       ├── location-service/                 # Location Service (Cities & Airports) - Port 5004
│       │   ├── src/main/java/com/noir/
│       │   │   ├── config/                   # CacheConfig (ConcurrentMapCacheManager)
│       │   │   ├── controller/               # CityController, AirportController
│       │   │   ├── mapper/                   # CityMapper, AirportMapper
│       │   │   ├── model/                    # City, Airport JPA Entities
│       │   │   ├── repository/               # CityRepository, AirportRepository
│       │   │   └── service/                  # CityService, AirportService & Implementations
│       │   └── src/main/resources/           # application.yaml (PostgreSQL: airline_location_db)
│       └── user-service/                     # User & Auth Service - Port 5001
│           ├── src/main/java/com/noir/
│           │   ├── config/                   # SecurityConfig, JwtProvider, JwtConstant
│           │   ├── controller/               # AuthController, UserController
│           │   ├── mapper/                   # UserMapper
│           │   ├── model/                    # User JPA Entity (mapped to "users" table)
│           │   ├── repository/               # UserRepository
│           │   └── service/                  # AuthService, CustomUserDetailsService & AuthServiceImpl
│           └── src/main/resources/           # application.yaml (PostgreSQL: airline_user_db)
└── README.md
```

---

## 🚀 Tech Stack

- **Language:** Java 17
- **Framework:** Spring Boot 4.x
- **Security:** Spring Security (Stateless sessions, BCrypt password hashing)
- **Authentication:** JJWT 0.12.6 (JSON Web Token HMAC-SHA256)
- **Persistence:** Spring Data JPA / Hibernate
- **Database:** PostgreSQL
- **Caching:** Spring Cache abstraction (`ConcurrentMapCacheManager`)
- **Validation:** Jakarta Bean Validation
- **Boilerplate Reduction:** Project Lombok
- **Build Tool:** Apache Maven (Multi-Module Reactor)

---

## 📦 Services Overview

### 1. Common Library (`common-lib`)
A shared library packaged as a JAR, providing:
- **Embeddables:**
  - `Address` (`street`, `postalCode`)
  - `GeoCode` (`latitude`, `longitude`)
- **Enums:**
  - `UserRole` (`ROLE_SYSTEM_ADMIN`, `ROLE_USER`, `ROLE_AIRLINE_OWNER`)
- **DTOs & Payloads:**
  - `UserDTO`, `LoginRequest`
  - `CityRequest`, `AirportRequest`
  - `CityResponse`, `AirportResponse`, `ApiResponse`, `AuthResponse`

### 2. Location Service (`location-service`) — Port `5004`
Handles geographical and navigational entities:
- **Cities:** Stores city code, name, country details, region, and timezone offset.
- **Airports:** Stores IATA codes (unique 3-letter code), coordinates, embedded address, timezone, and foreign relation to `City`.
- **In-Memory Caching:** Caches individual airports, lists of all airports, and airports filtered by city (`airports`, `allAirports`, `airportsByCity`) with automatic cache eviction on mutations.
- **Database:** PostgreSQL (`airline_location_db`)

### 3. User Service (`user-service`) — Port `5001`
Manages users, authentication, profiles, and roles across the airline system:
- **Registration & Authentication:** Sign up new users, validate credentials, and issue signed JWTs.
- **Spring Security:** Stateless session management with BCrypt password encoding.
- **JWT Provider:** Issues HMAC-SHA256 signed bearer tokens carrying claims (`email`, `userId`, `authorities`).
- **Database:** PostgreSQL (`airline_user_db`)

### 4. Cloud (`cloud`)
Infrastructure parent module for Eureka Service Discovery, Spring Cloud Gateway, and centralized configuration.

---

## 🗄 Database Configuration

Both services are configured to connect to PostgreSQL at `localhost:5432`:

| Service | Database Name | Port | DDL Mode |
| :--- | :--- | :--- | :--- |
| `location-service` | `airline_location_db` | `5004` | `update` |
| `user-service` | `airline_user_db` | `5001` | `update` |

### Sample YAML Configuration (`application.yaml`):
```yaml
server:
  port: 5001

spring:
  application:
    name: user-service

  datasource:
    url: jdbc:postgresql://localhost:5432/airline_user_db
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

---

## 📡 API Endpoints Documentation

---

### 🔐 Authentication & User Endpoints (`user-service` — Port `5001`)

Base URL: `http://localhost:5001`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/signup` | Register a new user and receive a JWT token |
| `POST` | `/auth/login` | Authenticate with email/password and receive a JWT token |
| `GET` | `/api/users/status` | Health check endpoint returning service status |
| `GET` | `/api/users/test` | Simple string test endpoint |

#### Sample Signup Request (`POST /auth/signup`):
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "phone": "+919876543210",
  "role": "ROLE_USER"
}
```

#### Sample Login Request (`POST /auth/login`):
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

#### Sample Auth Response:
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login Successfully!",
  "title": "Welcome Back John Doe",
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "phone": "+919876543210",
    "role": "ROLE_USER",
    "lastLogin": "2026-10-14T23:30:00"
  }
}
```

---

### 🌆 City Endpoints (`location-service` — Port `5004`)

Base URL: `http://localhost:5004`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/cities` | Create a new city |
| `GET` | `/api/cities/{id}` | Get city by ID |
| `GET` | `/api/cities` | Get all cities (paginated & sorted: `page`, `size`, `sortBy`, `sortDirection`) |
| `PUT` | `/api/cities/{id}` | Update existing city |
| `DELETE` | `/api/cities/{id}` | Delete city by ID |
| `GET` | `/api/cities/search` | Search cities by keyword (`?keyword=...`) |
| `GET` | `/api/cities/country/{countryCode}` | Get cities by ISO country code |
| `GET` | `/api/cities/exists/{cityCode}` | Check if city code exists |

#### Sample Create City Request (`POST /api/cities`):
```json
{
  "name": "New Delhi",
  "cityCode": "DEL",
  "countryCode": "IN",
  "countryName": "India",
  "regionCode": "DL",
  "timeZoneOffset": "UTC+05:30"
}
```

---

### 🛫 Airport Endpoints (`location-service` — Port `5004`)

Base URL: `http://localhost:5004`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/airports` | Create an airport (requires valid `cityId`) |
| `GET` | `/api/airports/{id}` | Get airport by ID *(Cached)* |
| `GET` | `/api/airports` | Get list of all airports *(Cached)* |
| `PUT` | `/api/airports/{id}` | Update airport details *(Evicts cache)* |
| `DELETE` | `/api/airports/{id}` | Delete airport by ID *(Evicts cache)* |
| `GET` | `/api/airports/city/{cityId}` | Get airports in a given city *(Cached)* |
| `GET` | `/api/airports/iata/{iataCode}` | Get airport by 3-letter IATA code |

#### Sample Create Airport Request (`POST /api/airports`):
```json
{
  "iataCode": "DEL",
  "name": "Indira Gandhi International Airport",
  "cityId": 1,
  "timeZone": "Asia/Kolkata",
  "address": {
    "street": "Palam",
    "postalCode": "110037"
  },
  "geoCode": {
    "latitude": 28.5562,
    "longitude": 77.1000
  }
}
```

---

## 🛠 Setup & Run Instructions

### 1. Prerequisites
- **Java 17** or higher
- **Maven 3.8+**
- **PostgreSQL** running on port `5432`

### 2. Create Databases
In PostgreSQL, create the required databases:
```sql
CREATE DATABASE airline_location_db;
CREATE DATABASE airline_user_db;
```

### 3. Build Multi-Module Project
From the repository root or `microservice/` directory:
```bash
mvn clean install
```

### 4. Run Services
You can run services independently:

**Location Service:**
```bash
cd microservice/services/location-service
mvn spring-boot:run
```

**User Service:**
```bash
cd microservice/services/user-service
mvn spring-boot:run
```
