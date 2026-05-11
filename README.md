# StockMate 📦

> Panel de gestión de inventario para pequeños negocios — Java 21 · Spring Boot 4 · React 19 · Docker

![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0-brightgreen?logo=springboot)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ¿Qué es StockMate?

StockMate es una aplicación full-stack de gestión de inventario diseñada para negocios pequeños que necesitan controlar su stock, registrar movimientos de entrada y salida, y recibir alertas cuando un producto cae por debajo de su mínimo.

Cuenta con un sistema de roles (`ADMIN` / `OPERATOR`) que separa el backoffice de administración de las operaciones del día a día.

---

## Tech Stack

| Capa | Tecnología |
|---|---|
| Backend | Java 21, Spring Boot 4, Spring Security 6 |
| Persistencia | Spring Data JPA, Hibernate, PostgreSQL 16 |
| Auth | JWT (jjwt 0.13), BCrypt |
| Mapeo | MapStruct 1.6 + Lombok |
| API Docs | SpringDoc OpenAPI 3 (Swagger UI) |
| Frontend | React 19, React Router 7, Zustand 5, Tailwind CSS 4 |
| Notificaciones | Sonner |
| Build frontend | Vite 8, TypeScript 6, Bun |
| Contenedores | Docker, Docker Compose |
| Testing | JUnit 5, Testcontainers |

---

## Arquitectura

El backend sigue **Clean Architecture**. La regla de dependencia es estricta: las capas externas dependen de las internas, nunca al revés. Las anotaciones de Spring están confinadas a la capa de infraestructura.

```
com.stockmate.stockmate_backend/
│
├── domain/                    # Reglas de negocio puras — sin dependencias de Spring
│   ├── model/                 # Category, Product, StockMovement, User, enums
│   ├── resposity/             # Interfaces de repositorio (puertos)
│   └── service/               # Lógica de dominio
│
├── application/               # Casos de uso y DTOs
│   ├── dto/
│   │   ├── request/           # AuthLoginDTO, ProductCreationDTO, StockMovementCreationDTO…
│   │   └── response/          # ProductInfoDTO, CategoryInfoDTO, UserInfoDTO…
│   └── usecase/               # alert/ auth/ product/ stock/ user/
│
├── infrastructure/            # Frameworks y adaptadores
│   ├── persistance/
│   │   ├── entity/            # FilterProductsOptions, FilterMovementsOptions, RefreshToken
│   │   ├── mapper/            # MapStruct mappers (domain ↔ DTO)
│   │   ├── repository/        # JwtRepository
│   │   └── service/           # JwtService
│   ├── security/
│   │   ├── config/            # SecurityConfig
│   │   └── jwt/               # JwtFilter
│   └── web/
│       ├── controller/        # AuthController, ProductController, CategoryController…
│       ├── advise/            # @RestControllerAdvice
│       └── exception/         # GlobalNoEntityFoundExceptionHandler
│
└── shared/
    └── exception/             # Excepciones base
```

El frontend es una SPA en React con React Router 7 en modo declarativo:

```
src/
├── layouts/                   # Layout, Sidebar (compound), TopBar (compound)
├── pages/                     # Dashboard, Products, Alerts, Users, Categories, Movements
├── components/
│   ├── generics/              # Modal, DropdownInput, Pagination, ErrorBoundary
│   └── modals/usecases/       # CreateMovement, UpsertProduct, DeleteProduct, CreateCategory
├── stores/                    # Zustand — AuthStore (persistido en localStorage)
├── types/                     # Product, Category, StockMovement, UserInfo, Resume
└── utils/                     # apiCall, safeRequest, sendCertificatedRequest, transcurredTime
```

---

## Funcionalidades

### Roles

| Pantalla | OPERATOR | ADMIN |
|---|---|---|
| Dashboard | ✓ | ✓ |
| Movimientos | ✓ | ✓ |
| Registrar movimiento | ✓ | ✓ |
| Alertas de stock | — | ✓ |
| Productos (backoffice) | — | ✓ |
| Usuarios (backoffice) | — | ✓ |
| Categorías (backoffice) | — | ✓ |

### Módulos principales

**Dashboard** — métricas de productos activos, alertas, movimientos del día y valor total de stock. Tabla de últimos 10 movimientos.

**Movimientos** — historial paginado y filtrable por producto, tipo y fecha. Registro de entradas y salidas con motivo obligatorio. Validación de stock negativo en el backend (HTTP 422).

**Alertas** — lista priorizada de productos bajo mínimos, clasificados en sin stock / crítico / bajo. Acción rápida de entrada desde la propia alerta.

**Productos** — CRUD completo con soft-delete. Stock calculado en tiempo real a partir del historial de movimientos, nunca almacenado directamente.

**Usuarios** — gestión de roles y activación/desactivación de cuentas. Cambio de contraseña desde el dropdown del sidebar.

**Categorías** — gestión de categorías con bloqueo de borrado si tienen productos activos asociados.

---

## API REST

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Público | Login — devuelve JWT + refresh token |
| `POST` | `/api/v1/auth/refresh` | Público | Renovar access token |
| `GET` | `/api/v1/products` | AUTH | Listado paginado con filtros |
| `GET` | `/api/v1/products/alerts` | ADMIN | Productos bajo mínimo |
| `GET` | `/api/v1/products/resume` | ADMIN | Métricas de resumen |
| `POST` | `/api/v1/products` | ADMIN | Crear producto |
| `PUT` | `/api/v1/products/{id}` | ADMIN | Editar producto |
| `DELETE` | `/api/v1/products/{id}` | ADMIN | Soft-delete |
| `GET` | `/api/v1/movements` | AUTH | Historial paginado |
| `POST` | `/api/v1/movements` | AUTH | Registrar movimiento |
| `GET` | `/api/v1/categories` | AUTH | Listar categorías con productCount |
| `POST` | `/api/v1/categories` | ADMIN | Crear categoría |
| `PUT` | `/api/v1/categories/{id}` | ADMIN | Editar categoría |
| `DELETE` | `/api/v1/categories/{id}` | ADMIN | Eliminar (falla si tiene productos) |
| `GET` | `/api/v1/users` | ADMIN | Listar usuarios |
| `PATCH` | `/api/v1/users/{id}/role` | ADMIN | Cambiar rol |
| `PATCH` | `/api/v1/users/{id}/status` | ADMIN | Activar / desactivar |
| `PATCH` | `/api/v1/users/{id}/password` | AUTH | Cambiar contraseña propia |

Documentación interactiva disponible en `http://localhost:8080/swagger-ui.html` con el entorno levantado.

---

## Puesta en marcha

### Requisitos

- Docker y Docker Compose

### Levantar el entorno completo

```bash
git clone https://github.com/GasparKral/stockmate.git
cd stockmate
docker compose up --build
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| PostgreSQL | localhost:5432 |

El esquema de base de datos se aplica automáticamente desde `schema.sql` al arrancar el contenedor de PostgreSQL.

### Variables de entorno

El archivo `.env` en la raíz del proyecto controla la configuración. Por defecto:

```env
DB_URL=jdbc:postgresql://postgres:5432/stockmate
DB_USERNAME=stockmate
DB_PASSWORD=stockmate_pass
JWT_SECRET=change-this-in-production
```

> ⚠️ Cambia `JWT_SECRET` por un valor seguro de al menos 256 bits antes de cualquier despliegue.

### Desarrollo local (sin Docker)

**Backend:**
```bash
cd stockmate-backend
./gradlew bootRun
# Requiere PostgreSQL corriendo en localhost:5432
# Usa el perfil dev: ./gradlew bootRun --args='--spring.profiles.active=dev'
```

**Frontend:**
```bash
cd stockmate-frontend
bun install
bun dev
```

---

## Tests

```bash
cd stockmate-backend

# Ejecutar todos los tests
./gradlew test

# Tests con informe de cobertura
./gradlew test jacocoTestReport
# Informe disponible en build/reports/jacoco/test/html/index.html
```

Los tests usan Testcontainers — requieren Docker corriendo en la máquina. No se necesita ninguna base de datos externa para ejecutarlos.

---

## Estructura del repositorio

```
stockmate/
├── compose.yaml                  # Orquestación Docker (postgres + backend + frontend)
├── schema.sql                    # DDL inicial de la base de datos
├── stockmate-backend/            # API Spring Boot
│   ├── Dockerfile
│   ├── build.gradle.kts
│   └── src/
└── stockmate-frontend/           # SPA React
    ├── Dockerfile
    ├── nginx.conf
    └── src/
```

---

## Licencia

MIT © [Gaspar Gómez Kral](https://github.com/GasparKral)
