# StockMate 📦

> Inventory management panel for small businesses — built with Java 21, Spring Boot 4.0.6, React 19 and Docker.

![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.6-brightgreen?logo=springboot)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Overview

StockMate is a full-stack inventory management application designed for small businesses that need to track products, register stock movements and receive low-stock alerts. It features a role-based access system with a dedicated backoffice for administrators.

**Key capabilities:**
- Product and category management with configurable minimum stock thresholds
- Real-time stock tracking via entry/exit movement registration
- Automatic low-stock alerts surfaced in the admin dashboard
- Role-based access: `ADMIN` (full backoffice) and `OPERATOR` (stock operations only)
- Stateless JWT authentication with refresh token support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.3, Spring Security 6 |
| Persistence | Spring Data JPA, Hibernate, PostgreSQL 16 |
| Auth | JWT (jjwt), BCrypt password encoding |
| API Docs | SpringDoc OpenAPI 3 (Swagger UI) |
| Testing | JUnit 5, Mockito, MockMvc, Testcontainers |
| Frontend | React 18, React Router 6, Zustand, Axios |
| Containerization | Docker, Docker Compose |
| CI | GitHub Actions |

---

## Architecture

The backend follows **Clean Architecture** principles. The dependency rule is strictly enforced: outer layers depend on inner layers, never the reverse. Spring annotations are confined to the `infrastructure` layer.

```
stockmate-backend/src/main/java/com/stockmate/
│
├── domain/                    # Enterprise business rules (no Spring dependencies)
│   ├── model/                 # Product, StockMovement, User, Category, Alert
│   ├── repository/            # Repository interfaces (ports)
│   ├── service/               # Domain services (pure logic)
│   └── exception/             # Domain-specific exceptions
│
├── application/               # Application business rules
│   ├── usecase/               # One class per use case
│   │   ├── product/           # CreateProduct, UpdateProduct, DeleteProduct, GetProducts
│   │   ├── stock/             # RegisterMovement, GetStockSummary
│   │   ├── alert/             # GetLowStockAlerts
│   │   └── auth/              # Login, RefreshToken, RegisterUser
│   └── dto/                   # Request and Response DTOs
│       ├── request/
│       └── response/
│
├── infrastructure/            # Frameworks, drivers, external concerns
│   ├── persistence/           # JPA entities + Spring Data repositories (adapters)
│   │   ├── entity/
│   │   ├── repository/
│   │   └── mapper/            # Domain model <-> JPA entity mappers
│   ├── security/              # Spring Security config, JWT filter, UserDetailsService
│   │   ├── jwt/
│   │   └── config/
│   └── web/                   # REST controllers, exception handler, OpenAPI config
│       ├── controller/
│       ├── advice/            # @RestControllerAdvice
│       └── config/
│
└── shared/                    # Cross-cutting utilities
    └── exception/             # Base exception classes
```

### Dependency Rule

```
Web Controller  →  Use Case  →  Domain Service  →  Domain Model
                       ↓
               Repository Interface (domain)
                       ↑
               JPA Repository (infrastructure, implements the interface)
```

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register new user (OPERATOR by default) |
| `POST` | `/api/v1/auth/login` | Public | Obtain JWT access + refresh token |
| `POST` | `/api/v1/auth/refresh` | Public | Refresh access token |

### Products
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/products` | AUTH | List all products (paginated) |
| `GET` | `/api/v1/products/{id}` | AUTH | Get product by ID |
| `POST` | `/api/v1/products` | ADMIN | Create product |
| `PUT` | `/api/v1/products/{id}` | ADMIN | Update product |
| `DELETE` | `/api/v1/products/{id}` | ADMIN | Soft-delete product |
| `GET` | `/api/v1/products/alerts` | ADMIN | List products below minimum stock |

### Stock Movements
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/movements` | AUTH | Register stock entry or exit |
| `GET` | `/api/v1/movements` | ADMIN | List all movements (paginated, filterable) |
| `GET` | `/api/v1/movements/product/{id}` | AUTH | Movement history for a product |

### Categories
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/categories` | AUTH | List all categories |
| `POST` | `/api/v1/categories` | ADMIN | Create category |
| `DELETE` | `/api/v1/categories/{id}` | ADMIN | Delete category |

### Users (Backoffice)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/users` | ADMIN | List all users |
| `PATCH` | `/api/v1/users/{id}/role` | ADMIN | Change user role |
| `PATCH` | `/api/v1/users/{id}/status` | ADMIN | Enable/disable user |

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (frontend only)
- Java 21 + Gradle (local backend dev only)

### Run with Docker Compose

```bash
git clone https://github.com/GasparKral/stockmate.git
cd stockmate
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| PostgreSQL | localhost:5432 |

### Default credentials (seeded on first run)

| Role | Email | Password |
|---|---|---|
| Admin | admin@stockmate.com | admin123 |
| Operator | operator@stockmate.com | operator123 |

---

## Running Tests

```bash
# Unit + integration tests
./mvnw test

# With coverage report (target/site/jacoco)
./mvnw verify
```

Tests are structured in three layers:
- **Unit tests** — domain services and use cases, no Spring context, pure JUnit 5 + Mockito
- **Integration tests** — controllers with MockMvc + Spring Security, H2 in-memory DB
- **Slice tests** — JPA repository tests with `@DataJpaTest`

---

## Project Structure (full)

```
stockmate/
├── stockmate-backend/         # Spring Boot application
│   ├── src/
│   │   ├── main/java/com/stockmate/
│   │   └── test/java/com/stockmate/
│   ├── Dockerfile
│   └── pom.xml
│
├── stockmate-frontend/        # React application
│   ├── src/
│   │   ├── api/               # Axios client + endpoint functions
│   │   ├── components/        # Shared UI components
│   │   ├── pages/
│   │   │   ├── auth/          # Login page
│   │   │   ├── operator/      # Stock dashboard
│   │   │   └── admin/         # Backoffice (products, users, alerts)
│   │   ├── store/             # Zustand stores
│   │   └── router/            # Protected routes by role
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## Environment Variables

### Backend (`stockmate-backend/.env`)

```env
DB_URL=jdbc:postgresql://postgres:5432/stockmate
DB_USERNAME=stockmate
DB_PASSWORD=stockmate_pass
JWT_SECRET=your-256-bit-secret-here
JWT_ACCESS_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000
```

### Frontend (`stockmate-frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

## Roadmap

- [ ] CSV export of movement history
- [ ] Email notifications for critical stock alerts
- [ ] Dashboard charts (stock evolution over time)
- [ ] Barcode scanner support (frontend)

---

## License

MIT © Gaspar Gómez Kral