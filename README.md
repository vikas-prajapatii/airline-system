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
│   │   │   ├── embeddable/                   # Address, GeoCode, Support
│   │   │   ├── enums/                        # UserRole, AircraftStatus, AirlineStatus
│   │   │   └── payload/
│   │   │       ├── dto/                      # UserDTO
│   │   │       ├── request/                  # CityRequest, AirportRequest, LoginRequest, AircraftRequest, AirlineRequest
│   │   │       └── response/                 # CityResponse, AirportResponse, ApiResponse, AuthResponse, AircraftResponse, AirlineResponse, AirlineDropdownItem
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
│       ├── user-service/                     # User & Auth Service - Port 5001
│       │   ├── src/main/java/com/noir/
│       │   │   ├── config/                   # SecurityConfig, JwtProvider, JwtConstant
│       │   │   ├── controller/               # AuthController, UserController
│       │   │   ├── mapper/                   # UserMapper
│       │   │   ├── model/                    # User JPA Entity (mapped to "users" table)
│       │   │   ├── repository/               # UserRepository
│       │   │   └── service/                  # AuthService, UserService, CustomUserDetailsService & Implementations
│       │   └── src/main/resources/           # application.yaml (PostgreSQL: airline_user_db)
│       └── airline-core-service/             # Airline & Aircraft Core Service - Port 5002
│           ├── src/main/java/com/noir/
│           │   ├── controller/               # AirlineController, AircraftController
│           │   ├── mapper/                   # AirlineMapper, AircraftMapper
│           │   ├── model/                    # Airline, Aircraft JPA Entities
│           │   ├── repository/               # AirlineRepository, AircraftRepository
│           │   └── service/                  # AirlineService, AircraftService & Implementations
│           └── src/main/resources/           # application.yaml (PostgreSQL: airline_db)
└── README.md
```

---

## 🚀 Tech Stack

- **Language:** Java 17
- **Framework:** Spring Boot 4.x
- **Security:** Spring Security (Stateless sessions, BCrypt password hashing)
- **Authentication:** JJWT 0.12.6 (JSON Web Token HMAC-SHA256)
- **Persistence:** Spring Data JPA / Hibernate (with JPA Auditing)
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
  - `Support` (`email`, `phone`, `hours`)
- **Enums:**
  - `UserRole` (`ROLE_SYSTEM_ADMIN`, `ROLE_USER`, `ROLE_AIRLINE_OWNER`)
  - `AircraftStatus` (`ACTIVE`, `MAINTENANCE`, `INACTIVE`, `RETIRED`)
  - `AirlineStatus` (`ACTIVE`, `INACTIVE`, `SUSPENDED`, `PENDING`, `BANNED`)
- **DTOs & Payloads:**
  - `UserDTO`, `LoginRequest`
  - `CityRequest`, `AirportRequest`, `AircraftRequest`, `AirlineRequest`
  - `CityResponse`, `AirportResponse`, `ApiResponse`, `AuthResponse`, `AircraftResponse`, `AirlineResponse`, `AirlineDropdownItem`

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
- **User Management:** Profile fetching by email, user ID, and list all users.
- **Database:** PostgreSQL (`airline_user_db`)

### 4. Airline Core Service (`airline-core-service`) — Port `5002`
Manages airline operations and fleet aircraft:
- **Airlines:** Manages airline profiles (IATA/ICAO codes, owner ID, status lifecycle, alliance, embedded support contacts, auditing).
- **Aircraft Fleet:** Manages aircraft inventory (registration code, model, seating breakdown across economy, premium economy, business, first class, cruising speed, range, maintenance status).
- **Admin Governance:** Allows administrators to approve, suspend, or ban airlines.
- **Database:** PostgreSQL (`airline_db`)

---

## 🗄 Database Configuration

All services connect to PostgreSQL on `localhost:5432`:

| Service | Database Name | Port | DDL Mode |
| :--- | :--- | :--- | :--- |
| `location-service` | `airline_location_db` | `5004` | `update` |
| `user-service` | `airline_user_db` | `5001` | `update` |
| `airline-core-service` | `airline_db` | `5002` | `update` |

---

## 📡 API Endpoints Documentation

---

### 🔐 Authentication & User Endpoints (`user-service` — Port `5001`)

Base URL: `http://localhost:5001`

| Method | Endpoint | Description | Headers |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | Register a new user | None |
| `POST` | `/auth/login` | Authenticate and obtain JWT | None |
| `GET` | `/api/users/profile` | Get current user profile | `X-User-Email: <email>` |
| `GET` | `/api/users/{userId}` | Get user by ID | None |
| `GET` | `/api/users` | List all users | None |

---

### ✈️ Airline Endpoints (`airline-core-service` — Port `5002`)

Base URL: `http://localhost:5002`

| Method | Endpoint | Description | Headers |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/airlines` | Create an airline | `X-User-Id: <ownerId>` |
| `GET` | `/api/airlines/admin` | Get airline owned by authenticated user | `X-User-Id: <ownerId>` |
| `GET` | `/api/airlines/{id}` | Get airline by ID | None |
| `GET` | `/api/airlines` | Get paginated list of airlines | `page`, `size`, `sort` |
| `GET` | `/api/airlines/dropdown` | Get active airlines for dropdown selectors | None |
| `PUT` | `/api/airlines` | Update airline profile | `X-User-Id: <ownerId>` |
| `DELETE` | `/api/airlines/{id}` | Delete an airline | `X-User-Id: <ownerId>` |
| `POST` | `/api/airlines/{id}/approve` | Approve airline (sets status `ACTIVE`) | None |
| `POST` | `/api/airlines/{id}/suspend` | Suspend airline (sets status `INACTIVE`) | None |
| `POST` | `/api/airlines/{id}/ban` | Ban airline (sets status `BANNED`) | None |

#### Sample Create Airline Request (`POST /api/airlines`):
```json
{
  "iataCode": "AI",
  "icaoCode": "AIC",
  "name": "Air India",
  "alias": "Air India Ltd",
  "logoUrl": "https://example.com/logo.png",
  "website": "https://www.airindia.in",
  "alliance": "Star Alliance",
  "headquartersCityId": 1,
  "supportEmail": "support@airindia.in",
  "supportPhone": "+9118001801407",
  "supportHours": "24/7"
}
```

---

### 🛩 Aircraft Endpoints (`airline-core-service` — Port `5002`)

Base URL: `http://localhost:5002`

| Method | Endpoint | Description | Headers |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/aircrafts` | Create an aircraft for airline | `X-User-Id: <ownerId>` |
| `GET` | `/api/aircrafts/{id}` | Get aircraft details by ID | None |
| `GET` | `/api/aircrafts` | List all aircraft owned by authenticated owner | `X-User-Id: <ownerId>` |
| `PUT` | `/api/aircrafts/{id}` | Update aircraft details | `X-User-Id: <ownerId>` |
| `DELETE` | `/api/aircrafts/{id}` | Delete aircraft | `X-User-Id: <ownerId>` |

#### Sample Create Aircraft Request (`POST /api/aircrafts`):
```json
{
  "code": "VT-EXA",
  "model": "Airbus A320neo",
  "manufacturer": "Airbus",
  "seatingCapacity": 180,
  "economySeats": 150,
  "premiumEconomySeats": 18,
  "businessSeats": 12,
  "firstClassSeats": 0,
  "rangeKm": 6500,
  "cruisingSpeedKmh": 828,
  "maxAltitudeFt": 39000,
  "yearOfManufacture": 2022,
  "registrationDate": "2022-05-15",
  "nextMaintenanceDate": "2026-11-01",
  "status": "ACTIVE",
  "isAvailable": true,
  "currentAirportId": 1
}
```

---

### 🌆 City & Airport Endpoints (`location-service` — Port `5004`)

Base URL: `http://localhost:5004`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/cities` | Create a new city |
| `GET` | `/api/cities/{id}` | Get city by ID |
| `GET` | `/api/cities` | Get all cities (paginated) |
| `PUT` | `/api/cities/{id}` | Update existing city |
| `DELETE` | `/api/cities/{id}` | Delete city |
| `POST` | `/api/airports` | Create airport |
| `GET` | `/api/airports/{id}` | Get airport by ID *(Cached)* |
| `GET` | `/api/airports` | Get all airports *(Cached)* |
| `PUT` | `/api/airports/{id}` | Update airport *(Evicts cache)* |
| `DELETE` | `/api/airports/{id}` | Delete airport *(Evicts cache)* |
| `GET` | `/api/airports/city/{cityId}` | Get airports in a given city *(Cached)* |
| `GET` | `/api/airports/iata/{iataCode}` | Get airport by 3-letter IATA code |

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
CREATE DATABASE airline_db;
```

### 3. Build Multi-Module Project
From the repository root or `microservice/` directory:
```bash
mvn clean install
```

### 4. Run Services
Run services independently:

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

**Airline Core Service:**
```bash
cd microservice/services/airline-core-service
mvn spring-boot:run
```
