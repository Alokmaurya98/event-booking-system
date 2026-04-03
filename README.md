#  Event Booking System

This project was built as part of a backend assignment for TheLattice.

A production-ready RESTful API for browsing events and booking tickets, built with **Node.js**, **Express**, **Sequelize ORM**, and **MySQL**

---

## 🌐 Live Demo

- **API Base:** https://event-booking-system-production-8dd7.up.railway.app
- **Swagger UI:** https://event-booking-system-production-8dd7.up.railway.app/api-docs
- **Health Check:** https://event-booking-system-production-8dd7.up.railway.app/health

---

##  Features

- **JWT Authentication** — Register, login, and protected routes
- **Race Condition Protection** — Ticket booking uses `SELECT ... FOR UPDATE` inside a MySQL transaction to prevent overselling under concurrent load
- **Unique Booking Codes** — Every booking gets a cryptographically secure UUID (v4)
- **Input Validation** — All endpoints validated with `express-validator`
- **Rate Limiting** — 100 requests per 15 minutes per IP
- **Security Headers** — Powered by `helmet`
- **Swagger UI** — Interactive API docs at `/api-docs`
- **Docker Compose** — One-command deployment

---

##  Project Structure

```
event-booking/
├── src/
│   ├── app.js                 
│   ├── config/
│   │   └── database.js         
│   ├── controllers/            
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   └── bookingController.js
│   ├── middleware/
│   │   ├── auth.js             
│   │   └── errorHandler.js     
│   ├── models/
│   │   ├── index.js            
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── Booking.js
│   │   └── EventAttendance.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── userRoutes.js
│   ├── services/               
│   │   ├── authService.js
│   │   ├── eventService.js
│   │   └── bookingService.js   
│   └── validations/
│       └── index.js            
├── docs/
│   ├── schema.sql              
│   ├── swagger.yaml            
│   └── EventBooking.postman_collection.json
├── .env.example
├── .sequelizerc
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

##  Quick Start

### Using Docker 

```bash
# Clone the repo
git clone <your-repo-url>
cd event-booking

# Start everything (MySQL + API) in one command
docker-compose up --build
```

The API will be available at **http://localhost:3000**
Swagger docs at **http://localhost:3000/api-docs**

---

## 📡 API Endpoints

| Method | Endpoint                     | Auth | Description                         |
|--------|------------------------------|------|-------------------------------------|
| POST   | `/api/auth/register`         | ❌   | Register a new user                 |
| POST   | `/api/auth/login`            | ❌   | Login and get JWT token             |
| GET    | `/api/auth/me`               | ✅   | Get current user profile            |
| GET    | `/api/events`                | ❌   | List all upcoming events            |
| POST   | `/api/events`                | ✅   | Create a new event                  |
| POST   | `/api/bookings`              | ✅   | Book tickets (race-condition safe)  |
| GET    | `/api/users/:id/bookings`    | ✅   | Get all bookings for a user         |
| POST   | `/api/events/:id/attendance` | ✅   | Check in attendee by booking code   |

---

##  Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Get a token by registering or logging in.

---

##  Environment Variables

| Variable               | Description                        | Default       |
|------------------------|------------------------------------|---------------|
| `PORT`                 | Server port                        | `3000`        |
| `NODE_ENV`             | Environment                        | `development` |
| `DB_HOST`              | MySQL host                         | `localhost`   |
| `DB_PORT`              | MySQL port                         | `3306`        |
| `DB_NAME`              | Database name                      | —             |
| `DB_USER`              | MySQL user                         | —             |
| `DB_PASSWORD`          | MySQL password                     | —             |
| `JWT_SECRET`           | Secret for signing JWTs            | —             |
| `JWT_EXPIRES_IN`       | Token expiry                       | `7d`          |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms)             | `900000`      |
| `RATE_LIMIT_MAX`       | Max requests per window            | `100`         |



---

## 🧠 Key Design Decisions

### Race Condition Handling
When two users simultaneously try to book the last ticket, naive reads of `remaining_tickets` could allow both to succeed. This API prevents that by:

1. Opening a MySQL **transaction**
2. Locking the event row with `SELECT ... FOR UPDATE`
3. Checking `remaining_tickets` within the lock
4. Decrementing and committing atomically

```js
const event = await Event.findOne({
  where: { id: event_id },
  lock: transaction.LOCK.UPDATE,  // 🔒 row-level lock
  transaction,
});
```

### Unique Booking Codes
Each booking generates a UUID v4 using Node's built-in `crypto` module (via the `uuid` package), ensuring globally unique, non-guessable codes.

---

## 🧪 Testing with Postman

1. Import `docs/EventBooking.postman_collection.json` into Postman
2. Run **Register** or **Login** first — the token is saved automatically
3. Subsequent requests will use the saved `{{token}}` and `{{eventId}}`
4. To test against the live server, update the `baseUrl` variable to:
```
https://event-booking-system-production-8dd7.up.railway.app/api
```

---
