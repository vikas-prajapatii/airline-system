# ✈️ Airline Management System — Microservices

A production-grade, scalable **multi-module microservice platform** for end-to-end airline operations management, built with **Java 17**, **Spring Boot**, **Spring Security**, **Apache Kafka**, **Razorpay**, and **PostgreSQL**.

---

## 🏗 System Architecture & Modules

```
airline-system/
├── README.md
├── .gitignore
└── microservice/
    ├── pom.xml                                      # Microservices Parent Aggregator
    ├── common-lib/                                  # Shared Library (DTOs, Embeddables, Events, Enums)
    └── services/
        ├── user-service/           Port 5001        # Auth & User Management
        ├── airline-core-service/   Port 5002        # Airline & Aircraft Core
        ├── flight-ops-service/     Port 5003        # Flights, Schedules & Instances
        ├── location-service/       Port 5004        # Cities & Airports
        ├── pricing-service/        Port 5005        # Fares & Cabin Classes
        ├── Seat-Service/           Port 5006        # Seat Maps & Instances
        ├── ancillary-service/      Port 5007        # Ancillaries & Meals
        ├── booking-service/        Port 5008        # Bookings & Passengers
        └── payment-service/        Port 5009        # Payments via Razorpay
```

---

## 🚀 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Language** | Java 17 |
| **Framework** | Spring Boot 3.x |
| **Security** | Spring Security (Stateless, BCrypt) |
| **Authentication** | JJWT 0.12.6 (HMAC-SHA256 Bearer tokens) |
| **Persistence** | Spring Data JPA / Hibernate |
| **Database** | PostgreSQL (one DB per service) |
| **Messaging** | Apache Kafka (event-driven inter-service) |
| **Inter-service HTTP** | Spring Cloud OpenFeign + RestTemplate |
| **Payment Gateway** | Razorpay |
| **Caching** | Spring Cache (`ConcurrentMapCacheManager`) |
| **Validation** | Jakarta Bean Validation |
| **Boilerplate** | Project Lombok |
| **Build Tool** | Apache Maven (Multi-Module Reactor) |

---

## 📦 Services Overview

### 1. 📚 Common Library (`common-lib`)
A shared JAR consumed by every service. Provides:

#### Embeddables
`Address`, `GeoCode`, `Support`, `ContactInfo`, `BoardingBenefits`, `FlexibilityBenefits`, `InFlightBenefits`, `PremiumServiceBenefits`, `SeatBenefits`

#### Enums
`UserRole`, `AircraftStatus`, `AirlineStatus`, `AncillaryType`, `BookingStatus`, `CabinClassType`, `CoverageType`, `FlightStatus`, `Gender`, `PaymentGateway`, `PaymentStatus`, `SeatAvailabilityStatus`, `SeatType`, `TicketStatus`

#### Kafka Events
`BookingConfirmedEvent`, `FlightInstanceCreatedEvent`, `PassengerNotificationData`, `PaymentCompletedEvent`, `PaymentFailedEvent`

#### Request DTOs
`AircraftRequest`, `AirlineRequest`, `AirportRequest`, `AncillaryRequest`, `BaggagePolicyRequest`, `BookingRequest`, `CabinClassRequest`, `CityRequest`, `FareRequest`, `FlightCabinAncillaryRequest`, `FlightInstanceCabinRequest`, `FlightInstanceRequest`, `FlightMealRequest`, `FlightRequest`, `FlightScheduleRequest`, `FlightSearchRequest`, `InsuranceCoverageRequest`, `LoginRequest`, `MealRequest`, `PassengerRequest`, `PaymentInitiateRequest`, `PaymentVerifyRequest`, `SeatMapRequest`, `SeatRequest`

#### Response DTOs
`AircraftResponse`, `AirlineDropdownItem`, `AirlineResponse`, `AirportResponse`, `AncillaryResponse`, `ApiResponse`, `AuthResponse`, `BaggagePolicyResponse`, `BookingResponse`, `CabinClassResponse`, `CityResponse`, `FareResponse`, `FlightCabinAncillaryResponse`, `FlightInstanceResponse`, `FlightMealResponse`, `FlightResponse`, `FlightScheduleResponse`, `InsuranceCoverageResponse`, `MealResponse`, `PassengerResponse`, `PaymentInitiateResponse`, `PaymentLinkResponse`, `SeatInstanceResponse`, `SeatMapResponse`, `SeatResponse`, `TicketResponse`

---

### 2. 🔐 User Service (`user-service`) — Port `5001`
Manages users, authentication, profiles, and JWT lifecycle.
- Registration & login with BCrypt password hashing
- Stateless Spring Security with JJWT bearer tokens (HMAC-SHA256)
- JWT claims: `email`, `userId`, `authorities`
- Profile lookup by email, ID, and list all users
- **Database:** `airline_user_db`

---

### 3. ✈️ Airline Core Service (`airline-core-service`) — Port `5002`
Manages airline profiles and aircraft fleet inventory.
- Full airline lifecycle (create, update, delete, approve, suspend, ban)
- IATA/ICAO codes, alliance, owner linking, embedded support contacts
- Aircraft fleet: registration, model, seat breakdown (economy → first class), range, speed, maintenance
- Admin governance endpoints for status transitions
- **Database:** `airline_db`

---

### 4. 🛫 Flight Ops Service (`flight-ops-service`) — Port `5003`
Manages flights, schedules, and flight instances.
- Flight and route management
- Recurring schedule and one-off flight instance creation
- Kafka producer: publishes `FlightInstanceCreatedEvent`
- Inter-service: fetches airline data from `airline-core-service` via `RestTemplate`
- **Database:** `airline_flight_db`

---

### 5. 🌆 Location Service (`location-service`) — Port `5004`
Manages geographic entities used across the platform.
- Cities: name, code, country, region, timezone offset
- Airports: IATA code (unique 3-letter), coordinates, embedded address, timezone, city FK
- In-memory caching (`airports`, `allAirports`, `airportsByCity`) with eviction on mutations
- **Database:** `airline_location_db`

---

### 6. 💰 Pricing Service (`pricing-service`) — Port `5005`
Manages fares, cabin classes, and benefit bundles for flights.
- Cabin class definitions with capacity and benefit embeddings (`BoardingBenefits`, `FlexibilityBenefits`, `InFlightBenefits`, `PremiumServiceBenefits`, `SeatBenefits`)
- Fare structures with baggage policy associations
- **Database:** `airline_pricing_db`

---

### 7. 💺 Seat Service (`Seat-Service`) — Port `5006`
Manages seat maps and per-instance seat availability.
- Seat map templates (rows, left/right layout, cabin class)
- Seat instance creation per flight instance with availability tracking
- Seat type: `WINDOW`, `MIDDLE`, `AISLE`
- Status: `AVAILABLE`, `RESERVED`, `OCCUPIED`, `BLOCKED`
- **Database:** `airline_seat_db`

---

### 8. 🍱 Ancillary Service (`ancillary-service`) — Port `5007`
Manages ancillary services and in-flight meals for airlines.
- Ancillaries by type: `BAGGAGE`, `MEAL`, `INSURANCE`, `LOUNGE`, `WIFI`, `SPORT_EQUIPMENT`, etc.
- Insurance coverages with `CoverageType` enum
- Meal catalog: code, type, dietary restrictions, ingredients, advance booking rules
- Inter-service: links ancillaries to airline via `airline-core-service`
- **Database:** `airline_ancillary_db`

---

### 9. 📋 Booking Service (`booking-service`) — Port `5008`
Handles end-to-end booking flow with passenger management.
- Booking creation with multi-passenger support
- Seat assignment, meal selection, ancillary add-ons per passenger
- Ticket generation per passenger
- Booking status lifecycle: `PENDING` → `CONFIRMED` → `CANCELLED`
- Kafka producer: publishes `BookingConfirmedEvent`
- **Database:** `airline_booking_db`

---

### 10. 💳 Payment Service (`payment-service`) — Port `5009`
Handles payment initiation and verification via Razorpay.
- Creates Razorpay orders and generates payment links
- Verifies payment signature callbacks (HMAC validation)
- Kafka consumer: listens to `BookingConfirmedEvent` to trigger payment flow
- Kafka producer: publishes `PaymentCompletedEvent` / `PaymentFailedEvent`
- Inter-service: fetches booking data from `booking-service`, user data from `user-service`
- **Database:** `airline_payment_db`

---

## 🔄 Event-Driven Communication (Kafka)

```
booking-service  ──[BookingConfirmedEvent]──►  payment-service
payment-service  ──[PaymentCompletedEvent]──►  (booking-service / notifications)
payment-service  ──[PaymentFailedEvent]─────►  (booking-service / notifications)
flight-ops-service ─[FlightInstanceCreatedEvent]► (seat-service / ancillary-service)
```

---

## 🗄 Database Configuration

All services connect to **PostgreSQL** on `localhost:5432`:

| Service | Database | Port |
| :--- | :--- | :--- |
| `user-service` | `airline_user_db` | `5001` |
| `airline-core-service` | `airline_db` | `5002` |
| `flight-ops-service` | `airline_flight_db` | `5003` |
| `location-service` | `airline_location_db` | `5004` |
| `pricing-service` | `airline_pricing_db` | `5005` |
| `Seat-Service` | `airline_seat_db` | `5006` |
| `ancillary-service` | `airline_ancillary_db` | `5007` |
| `booking-service` | `airline_booking_db` | `5008` |
| `payment-service` | `airline_payment_db` | `5009` |

---

## 📡 API Endpoints

### 🔐 Auth & User (`user-service` — Port `5001`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/login` | Authenticate and obtain JWT |
| `GET` | `/api/users/profile` | Get profile (`X-User-Email` header) |
| `GET` | `/api/users/{userId}` | Get user by ID |
| `GET` | `/api/users` | List all users |

---

### ✈️ Airline (`airline-core-service` — Port `5002`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/airlines` | Create airline (`X-User-Id` header) |
| `GET` | `/api/airlines/admin` | Get own airline (`X-User-Id` header) |
| `GET` | `/api/airlines/{id}` | Get airline by ID |
| `GET` | `/api/airlines` | List airlines (paginated) |
| `GET` | `/api/airlines/dropdown` | Active airlines for dropdowns |
| `PUT` | `/api/airlines` | Update airline profile |
| `DELETE` | `/api/airlines/{id}` | Delete airline |
| `POST` | `/api/airlines/{id}/approve` | Approve airline |
| `POST` | `/api/airlines/{id}/suspend` | Suspend airline |
| `POST` | `/api/airlines/{id}/ban` | Ban airline |

---

### 🛩 Aircraft (`airline-core-service` — Port `5002`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/aircrafts` | Add aircraft (`X-User-Id` header) |
| `GET` | `/api/aircrafts/{id}` | Get aircraft by ID |
| `GET` | `/api/aircrafts` | List all aircraft (owner) |
| `PUT` | `/api/aircrafts/{id}` | Update aircraft |
| `DELETE` | `/api/aircrafts/{id}` | Delete aircraft |

---

### 🌆 Location (`location-service` — Port `5004`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/cities` | Create city |
| `GET` | `/api/cities/{id}` | Get city |
| `GET` | `/api/cities` | All cities (paginated) |
| `PUT` | `/api/cities/{id}` | Update city |
| `DELETE` | `/api/cities/{id}` | Delete city |
| `POST` | `/api/airports` | Create airport |
| `GET` | `/api/airports/{id}` | Get airport *(cached)* |
| `GET` | `/api/airports` | All airports *(cached)* |
| `PUT` | `/api/airports/{id}` | Update airport *(cache evicted)* |
| `DELETE` | `/api/airports/{id}` | Delete airport *(cache evicted)* |
| `GET` | `/api/airports/city/{cityId}` | Airports by city *(cached)* |
| `GET` | `/api/airports/iata/{iataCode}` | Airport by IATA code |

---

### 💺 Seat (`Seat-Service` — Port `5006`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/seat-maps` | Create seat map template |
| `GET` | `/api/seat-maps/{id}` | Get seat map |
| `GET` | `/api/seat-maps` | List seat maps |
| `PUT` | `/api/seat-maps/{id}` | Update seat map |
| `DELETE` | `/api/seat-maps/{id}` | Delete seat map |
| `POST` | `/api/seats` | Create seat |
| `GET` | `/api/seats/{id}` | Get seat |
| `GET` | `/api/seats/seat-map/{seatMapId}` | Seats by seat map |

---

### 💳 Payment (`payment-service` — Port `5009`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/payments/initiate` | Initiate Razorpay order |
| `POST` | `/api/payments/verify` | Verify payment signature |
| `GET` | `/api/payments/{bookingId}` | Get payment by booking |

---

## 🛠 Setup & Run Instructions

### Prerequisites
- **Java 17+**
- **Maven 3.8+**
- **PostgreSQL** on `localhost:5432`
- **Apache Kafka** on `localhost:9092`
- **Razorpay** API key & secret (for payment-service)

### 1. Create Databases
```sql
CREATE DATABASE airline_user_db;
CREATE DATABASE airline_db;
CREATE DATABASE airline_flight_db;
CREATE DATABASE airline_location_db;
CREATE DATABASE airline_pricing_db;
CREATE DATABASE airline_seat_db;
CREATE DATABASE airline_ancillary_db;
CREATE DATABASE airline_booking_db;
CREATE DATABASE airline_payment_db;
```

### 2. Build the Shared Library First
```bash
cd microservice/common-lib
mvn clean install
```

### 3. Build All Services
```bash
cd microservice
mvn clean install
```

### 4. Set Environment Variables (payment-service)
```bash
export RAZORPAY_API_KEY=your_razorpay_key
export RAZORPAY_API_SECRET=your_razorpay_secret
export KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

### 5. Run Services (recommended startup order)
```bash
# 1. Location & User (no dependencies)
cd microservice/services/location-service && mvn spring-boot:run
cd microservice/services/user-service && mvn spring-boot:run

# 2. Core services
cd microservice/services/airline-core-service && mvn spring-boot:run
cd microservice/services/pricing-service && mvn spring-boot:run

# 3. Operational services
cd microservice/services/flight-ops-service && mvn spring-boot:run
cd microservice/services/Seat-Service && mvn spring-boot:run
cd microservice/services/ancillary-service && mvn spring-boot:run

# 4. Transactional services
cd microservice/services/booking-service && mvn spring-boot:run
cd microservice/services/payment-service && mvn spring-boot:run
```

---

## 🔒 Security Notes

- All inter-service requests forward a `X-User-Id` header for owner validation.
- JWT bearer tokens must be included in the `Authorization: Bearer <token>` header for protected endpoints.
- Razorpay secrets should **never** be hardcoded — always use environment variables.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

> Built with ❤️ using Java 17 & Spring Boot Microservices
