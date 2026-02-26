# Car Rental System — Backend

A RESTful API for a car rental booking system built with Node.js, Express 5, and PostgreSQL. Supports user registration/authentication, car inventory management, and booking lifecycle management with role-based access control.

## Tech Stack

| Component        | Technology              |
| ---------------- | ----------------------- |
| Runtime          | Node.js >= 20           |
| Framework        | Express 5               |
| Database         | PostgreSQL 16           |
| Authentication   | JWT (jsonwebtoken)      |
| Password Hashing | bcrypt                  |
| Validation       | Zod                     |
| Testing          | Vitest + Supertest      |
| Containerization | Docker + Docker Compose |

## Getting Started

### Prerequisites

- Node.js >= 20
- PostgreSQL 16+ (or Docker)

### Option 1: Local Setup

```bash
# Clone the repository
git clone <repo-url>
cd CarRentalSystem-Backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and a strong JWT_SECRET

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### Option 2: Docker

```bash
# Configure environment
cp .env.example .env

# Start all services (app + PostgreSQL)
docker compose up -d

# Run migrations against the Docker database
docker compose exec app node src/db/migrate.js
```

## Scripts

| Command                 | Description                      |
| ----------------------- | -------------------------------- |
| `npm run dev`           | Start dev server with hot reload |
| `npm start`             | Start production server          |
| `npm run migrate`       | Run database migrations          |
| `npm test`              | Run all tests                    |
| `npm run test:watch`    | Run tests in watch mode          |
| `npm run test:coverage` | Run tests with coverage report   |
| `npm run lint`          | Run ESLint                       |
| `npm run format`        | Format code with Prettier        |

## Environment Variables

See [`.env.example`](.env.example) for all available variables:

| Variable             | Description                | Default |
| -------------------- | -------------------------- | ------- |
| `PORT`               | Server port                | `5001`  |
| `DB_USER`            | PostgreSQL username        | —       |
| `DB_HOST`            | PostgreSQL host            | —       |
| `DB_DATABASE`        | PostgreSQL database name   | —       |
| `DB_PORT`            | PostgreSQL port            | `5432`  |
| `DB_PASSWORD`        | PostgreSQL password        | —       |
| `CORS_ORIGIN`        | Allowed CORS origin        | `*`     |
| `JWT_SECRET`         | Secret key for JWT signing | —       |
| `JWT_EXPIRES_IN`     | JWT token expiration       | `7d`    |
| `BCRYPT_SALT_ROUNDS` | Bcrypt hashing cost factor | `12`    |

## API Endpoints

Base URL: `http://localhost:5001/api`

### Authentication

| Method | Endpoint         | Auth   | Description              |
| ------ | ---------------- | ------ | ------------------------ |
| POST   | `/auth/register` | Public | Register a new user      |
| POST   | `/auth/login`    | Public | Login and receive JWT    |
| GET    | `/auth/me`       | User   | Get current user profile |

### Users (Admin)

| Method | Endpoint     | Auth        | Description    |
| ------ | ------------ | ----------- | -------------- |
| GET    | `/users`     | Admin       | List all users |
| GET    | `/users/:id` | Admin       | Get user by ID |
| PATCH  | `/users/:id` | Owner/Admin | Update user    |
| DELETE | `/users/:id` | Owner/Admin | Delete user    |

### Cars

| Method | Endpoint    | Auth   | Description                             |
| ------ | ----------- | ------ | --------------------------------------- |
| GET    | `/cars`     | Public | List cars (`?available=true&brand=...`) |
| GET    | `/cars/:id` | Public | Get car details                         |
| POST   | `/cars`     | Admin  | Add a new car                           |
| PATCH  | `/cars/:id` | Admin  | Update car                              |
| DELETE | `/cars/:id` | Admin  | Remove a car                            |

### Bookings

| Method | Endpoint            | Auth        | Description                    |
| ------ | ------------------- | ----------- | ------------------------------ |
| POST   | `/bookings`         | User        | Create a booking               |
| GET    | `/bookings`         | User/Admin  | List bookings (scoped by role) |
| GET    | `/bookings/summary` | User        | Get booking stats              |
| GET    | `/bookings/:id`     | Owner/Admin | Get booking details            |
| PATCH  | `/bookings/:id`     | Owner/Admin | Update booking status          |

### Health Check

| Method | Endpoint | Description                 |
| ------ | -------- | --------------------------- |
| GET    | `/`      | Health check with DB status |

## Database Schema

```
users
├── id            SERIAL PRIMARY KEY
├── username      VARCHAR(255) UNIQUE NOT NULL
├── password      VARCHAR(255) NOT NULL (bcrypt hashed)
├── role          VARCHAR(20) NOT NULL DEFAULT 'user' CHECK ('user','admin')
└── created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

cars
├── id            SERIAL PRIMARY KEY
├── name          VARCHAR(255) NOT NULL
├── brand         VARCHAR(255) NOT NULL
├── model_year    INTEGER NOT NULL
├── rent_per_day  DECIMAL(10,2) NOT NULL
├── available     BOOLEAN NOT NULL DEFAULT true
└── created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

bookings
├── id            SERIAL PRIMARY KEY
├── user_id       INTEGER NOT NULL → users(id) ON DELETE CASCADE
├── car_id        INTEGER → cars(id)
├── car_name      VARCHAR(255) NOT NULL
├── days          INTEGER NOT NULL
├── rent_per_day  DECIMAL(10,2) NOT NULL
├── status        VARCHAR(50) NOT NULL DEFAULT 'booked' CHECK ('booked','completed','cancelled')
└── created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

## Project Structure

```
src/
├── index.js                 # Entry point, server startup, graceful shutdown
├── app.js                   # Express app config (CORS, helmet, rate limiting)
├── constants.js             # Shared constants (roles, booking statuses)
├── controllers/
│   ├── auth.controller.js   # Register, login, profile
│   ├── user.controller.js   # User CRUD (admin)
│   ├── car.controller.js    # Car CRUD
│   └── booking.controller.js# Booking lifecycle
├── routes/
│   ├── index.js             # Route aggregator (/api)
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── car.routes.js
│   └── booking.routes.js
├── models/
│   ├── user.model.js        # User data access (bcrypt integrated)
│   ├── car.model.js         # Car data access
│   └── booking.model.js     # Booking data access
├── middleware/
│   ├── auth.middleware.js    # JWT verification
│   ├── authorize.js         # Role-based access control
│   ├── validate.js          # Zod schema validation
│   └── errorHandler.js      # Global error handler
├── validators/
│   ├── auth.validator.js    # Register/login schemas
│   ├── user.validator.js    # User update schema
│   ├── car.validator.js     # Car create/update schemas
│   └── booking.validator.js # Booking create/update schemas
├── utils/
│   ├── ApiError.js          # Custom error class
│   ├── ApiResponse.js       # Standardized response wrapper
│   └── asyncHandler.js      # Async middleware wrapper
└── db/
    ├── db.js                # PostgreSQL connection pool
    ├── migrate.js           # Migration runner
    └── migrations/
        ├── 001_create_users_table.sql
        ├── 002_create_bookings_table.sql
        ├── 003_add_role_to_users.sql
        ├── 004_create_cars_table.sql
        └── 005_add_car_id_to_bookings.sql
tests/
├── helpers/
│   ├── setup.js             # Test env config
│   ├── auth.js              # JWT token generators
│   └── app.js               # Test app instance
├── unit/
│   ├── utils/               # ApiError, ApiResponse, asyncHandler tests
│   └── middleware/           # Auth, authorize, validate, errorHandler tests
└── integration/
    ├── auth.test.js          # Auth flow tests
    ├── cars.test.js          # Car CRUD tests
    ├── bookings.test.js      # Booking lifecycle tests
    └── users.test.js         # User management tests
```

## License

ISC
