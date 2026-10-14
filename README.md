# Airline Management System (Microservices)

A scalable, multi-module microservice-based airline management platform built with **Java 17**, **Spring Boot**, **Spring Data JPA**, **Spring Cache**, and **PostgreSQL**.

---

## 🏗 System Architecture & Modules

The repository is organized as a Maven multi-module project:

```
airline-system/
├── pom.xml                                   # Root Reactor Parent POM
├── microservice/
│   ├── pom.xml                               # Microservices Parent Aggregator
│   ├── common-lib/                           # Shared DTOs, Embeddables, Utilities
│   │   ├── src/main/java/com/noir/
│   │   │   ├── embeddable/                   # Address, GeoCode
│   │   │   └── payload/
│   │   │       ├── request/                  # CityRequest, AirportRequest
│   │   │       └── response/                 # CityResponse, AirportResponse, ApiResponse
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
│           ├── src/main/java/com/noir/       # UserServiceApplication
│           └── src/main/resources/           # application.yaml (PostgreSQL: airline_user_db)
└── README.md
```

---

## 🚀 Tech Stack

- **Language:** Java 17
- **Framework:** Spring Boot 4.x
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
- **Request Payloads:** `CityRequest`, `AirportRequest`
- **Response Payloads:** `CityResponse`, `AirportResponse`, `ApiResponse`

### 2. Location Service (`location-service`) — Port `5004`
Handles geographical and navigational entities:
- **Cities:** Stores city code, name, country details, region, and timezone offset.
- **Airports:** Stores IATA codes (unique 3-letter code), coordinates, embedded address, timezone, and foreign relation to `City`.
- **In-Memory Caching:** Caches individual airports, lists of all airports, and airports filtered by city (`airports`, `allAirports`, `airportsByCity`) with automatic cache eviction on mutations.
- **Database:** PostgreSQL (`airline_location_db`)

### 3. User Service (`user-service`) — Port `5001`
Manages users, authentication, profiles, and roles across the airline system.
- **Database:** PostgreSQL (`airline_user_db`)

### 4. Cloud (`cloud`)
Infrastructure parent module for future Eureka Service Discovery, Spring Cloud Gateway, and centralized configuration.

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
  port: 5004

spring:
  application:
    name: location-service

  datasource:
    url: jdbc:postgresql://localhost:5432/airline_location_db
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

Base URL: `http://localhost:5004` (Location Service)

### 🌆 City Endpoints (`/api/cities`)

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

### 🛫 Airport Endpoints (`/api/airports`)

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
