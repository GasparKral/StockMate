# StockMate — Technical Requirements

## 1. Data Models

---

### 1.1 User

The `User` entity handles authentication and authorization. Passwords are always stored hashed (BCrypt). The `status` field allows admins to disable accounts without deleting them.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | PK, auto-generated | Use `UUID` over `Long` — better for distributed systems and avoids sequential ID exposure |
| `email` | `String` | NOT NULL, UNIQUE, max 150 | Used as the login username |
| `password` | `String` | NOT NULL | BCrypt hash, never plaintext |
| `fullName` | `String` | NOT NULL, max 100 | Display name |
| `role` | `Enum(Role)` | NOT NULL, default OPERATOR | `ADMIN` or `OPERATOR` |
| `status` | `Enum(UserStatus)` | NOT NULL, default ACTIVE | `ACTIVE` or `DISABLED` |
| `createdAt` | `Instant` | NOT NULL, auto | Set by JPA `@CreatedDate` |
| `updatedAt` | `Instant` | NOT NULL, auto | Set by JPA `@LastModifiedDate` |

**Enums:**
```
Role:        ADMIN, OPERATOR
UserStatus:  ACTIVE, DISABLED
```

**Business rules:**
- A disabled user (`DISABLED`) must be rejected at login with a clear error message, not a generic auth failure.
- Only an `ADMIN` can change another user's role or status.
- The first seeded admin account cannot be disabled or demoted by other admins.
- Email must be validated on creation (format check) and treated as case-insensitive (store lowercase).

---

### 1.2 Category

Simple reference entity for grouping products.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `Long` | PK, auto-increment | Simple sequence is fine here |
| `name` | `String` | NOT NULL, UNIQUE, max 80 | e.g. "Electronics", "Cleaning supplies" |
| `description` | `String` | nullable, max 255 | Optional |
| `createdAt` | `Instant` | NOT NULL, auto | |

**Business rules:**
- A category cannot be deleted if it has associated products. Return a `409 Conflict`.
- Category names are case-insensitive for uniqueness (store as-is, compare lowercase).

---

### 1.3 Product

The central entity. Stock level is never stored directly — it is always **computed** from movements.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | PK, auto-generated | |
| `sku` | `String` | NOT NULL, UNIQUE, max 50 | Stock Keeping Unit — user-defined code (e.g. "ELEC-0042") |
| `name` | `String` | NOT NULL, max 150 | |
| `description` | `String` | nullable, max 500 | |
| `category` | `Category` | NOT NULL, FK | Many-to-one |
| `unitPrice` | `BigDecimal` | NOT NULL, ≥ 0, scale 2 | Use `BigDecimal`, never `float`/`double` for money |
| `unit` | `String` | NOT NULL, max 30 | e.g. "units", "kg", "liters" |
| `minStock` | `Integer` | NOT NULL, ≥ 0, default 0 | Threshold below which an alert is raised |
| `deleted` | `Boolean` | NOT NULL, default false | Soft-delete flag — never hard-delete products with movements |
| `createdAt` | `Instant` | NOT NULL, auto | |
| `updatedAt` | `Instant` | NOT NULL, auto | |
| `createdBy` | `UUID` (User) | NOT NULL, FK | The admin who created the product |

**Computed field (not persisted):**
- `currentStock: Integer` — sum of all non-deleted movements for this product. Returned in API responses, never stored in the `products` table.

**Business rules:**
- SKU must be unique and immutable after creation.
- Soft-deleted products still appear in movement history but are excluded from active listings by default.
- A product is "in alert" when `currentStock < minStock`. The `/products/alerts` endpoint returns only these.
- `unitPrice` changes do not affect historical movement records.

---

### 1.4 StockMovement

Every change to stock — incoming or outgoing — is recorded as an immutable event. This is the source of truth for stock levels.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | PK, auto-generated | |
| `product` | `Product` | NOT NULL, FK | |
| `type` | `Enum(MovementType)` | NOT NULL | `ENTRY` or `EXIT` |
| `quantity` | `Integer` | NOT NULL, > 0 | Always positive; `type` determines direction |
| `reason` | `Enum(MovementReason)` | NOT NULL | See reason enum below |
| `notes` | `String` | nullable, max 300 | Optional free-text explanation |
| `registeredAt` | `Instant` | NOT NULL, auto | Timestamp of registration |
| `registeredBy` | `UUID` (User) | NOT NULL, FK | Who registered the movement |

**Enums:**
```
MovementType:
  ENTRY   — stock coming in
  EXIT    — stock going out

MovementReason:
  PURCHASE        — ENTRY: restocking from supplier
  RETURN          — ENTRY: customer return
  ADJUSTMENT_IN   — ENTRY: inventory correction (manual add)
  SALE            — EXIT: product sold
  WASTE           — EXIT: expired, damaged, or discarded
  ADJUSTMENT_OUT  — EXIT: inventory correction (manual remove)
```

**Business rules:**
- Movements are **immutable** — no UPDATE or DELETE operations are exposed. Mistakes are corrected with a counter-movement.
- An `EXIT` movement that would result in negative stock must be **rejected** (HTTP 422) with a message indicating the available quantity.
- `quantity` must always be a positive integer (> 0). The sign is derived from `type`.
- Movement history is never purged, even when a product is soft-deleted.

---

### 1.5 RefreshToken

Stored server-side to allow controlled revocation (e.g. on logout or user disable).

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `Long` | PK, auto-increment | |
| `token` | `String` | NOT NULL, UNIQUE | UUID-based random string |
| `user` | `User` | NOT NULL, FK | |
| `expiresAt` | `Instant` | NOT NULL | |
| `revoked` | `Boolean` | NOT NULL, default false | Set to true on logout or user disable |

**Business rules:**
- A user can only have one valid refresh token at a time. Issuing a new one revokes the previous.
- When a user is disabled by an admin, their refresh token is immediately revoked.
- Expired or revoked tokens return `401 Unauthorized`.

---

## 2. Stock Calculation

Stock for a given product is calculated as:

```
currentStock = SUM(quantity WHERE type = ENTRY) - SUM(quantity WHERE type = EXIT)
```

This query is run via a JPQL or native query on the `stock_movements` table, filtered by `product_id`. For the MVP, this is acceptable. If performance becomes a concern, a `currentStock` cache column can be added later as a read-optimization.

---

## 3. JWT Strategy

| Token | Lifespan | Storage |
|---|---|---|
| Access token | 15 minutes | Memory (frontend) — never in localStorage |
| Refresh token | 7 days | `HttpOnly` cookie or localStorage (configurable) |

Token payload (claims):
```json
{
  "sub": "<user-uuid>",
  "email": "user@example.com",
  "role": "ADMIN",
  "iat": 1710000000,
  "exp": 1710000900
}
```

The `role` claim is read by the JWT filter and used to populate the Spring Security `Authentication` object. No database call is needed per request.

---

## 4. Security Rules Summary

| Endpoint pattern | Allowed roles |
|---|---|
| `POST /auth/**` | Public |
| `GET /products`, `GET /products/{id}` | ADMIN, OPERATOR |
| `POST /movements`, `GET /movements/product/{id}` | ADMIN, OPERATOR |
| `POST /products`, `PUT /products/**`, `DELETE /products/**` | ADMIN only |
| `GET /products/alerts` | ADMIN only |
| `GET /movements` | ADMIN only |
| `GET /categories` | ADMIN, OPERATOR |
| `POST /categories`, `DELETE /categories/**` | ADMIN only |
| `GET /users`, `PATCH /users/**` | ADMIN only |

---

## 5. Database Schema (simplified DDL)

```sql
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(100) NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'OPERATOR',
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(80)  NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku         VARCHAR(50)     NOT NULL UNIQUE,
    name        VARCHAR(150)    NOT NULL,
    description VARCHAR(500),
    category_id BIGINT          NOT NULL REFERENCES categories(id),
    unit_price  NUMERIC(10, 2)  NOT NULL,
    unit        VARCHAR(30)     NOT NULL,
    min_stock   INTEGER         NOT NULL DEFAULT 0,
    deleted     BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by  UUID            NOT NULL REFERENCES users(id)
);

CREATE TABLE stock_movements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID        NOT NULL REFERENCES products(id),
    type            VARCHAR(10) NOT NULL,
    quantity        INTEGER     NOT NULL CHECK (quantity > 0),
    reason          VARCHAR(30) NOT NULL,
    notes           VARCHAR(300),
    registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    registered_by   UUID        NOT NULL REFERENCES users(id)
);

CREATE TABLE refresh_tokens (
    id          BIGSERIAL PRIMARY KEY,
    token       VARCHAR(255) NOT NULL UNIQUE,
    user_id     UUID         NOT NULL REFERENCES users(id),
    expires_at  TIMESTAMPTZ  NOT NULL,
    revoked     BOOLEAN      NOT NULL DEFAULT FALSE
);
```

---

## 6. Validation Rules (Bean Validation)

| Entity | Field | Constraint |
|---|---|---|
| User | email | `@Email`, `@NotBlank`, max 150 |
| User | password (on registration) | `@NotBlank`, min 8 chars |
| User | fullName | `@NotBlank`, max 100 |
| Product | sku | `@NotBlank`, max 50, pattern `[A-Z0-9\-]+` |
| Product | name | `@NotBlank`, max 150 |
| Product | unitPrice | `@NotNull`, `@DecimalMin("0.00")` |
| Product | minStock | `@NotNull`, `@Min(0)` |
| Product | categoryId | `@NotNull` |
| StockMovement | quantity | `@NotNull`, `@Min(1)` |
| StockMovement | type | `@NotNull` |
| StockMovement | reason | `@NotNull` |