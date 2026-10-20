# TripTailor Backend

REST API for **TripTailor**, a mobile travel-planning app. It handles user accounts, serves city data, and generates personalised day-by-day itineraries with the OpenAI API.

> Mobile app: [TripTailorFrontend](https://github.com/tahmoor20/TripTailorFrontend)

## Features

- Sign up and sign in with hashed passwords (bcrypt) and JWT sessions
- Profile endpoint with profile-picture upload
- City catalogue with 3-day sample plans, plus random city suggestions for the trip form
- AI itinerary generation from destination, dates, companion, interests and budget
- Input validation, rate limiting, central error handling, and a test suite that runs without a real database or OpenAI key

## Tech stack

- Node.js, Express
- MongoDB Atlas (official `mongodb` driver)
- OpenAI API (`openai` SDK)
- bcryptjs, jsonwebtoken, multer, express-rate-limit
- Jest and Supertest for tests, ESLint, GitHub Actions CI

## API

All routes are prefixed with `/api`. Errors always have the shape `{ "message": "..." }`.

| Method | Endpoint                 | Auth   | Description                                         |
| ------ | ------------------------ | ------ | --------------------------------------------------- |
| POST   | `/api/signup`            | No     | Create an account. Returns `{ token, fullName }`    |
| POST   | `/api/signin`            | No     | Sign in. Returns `{ token, fullName }`              |
| GET    | `/api/user`              | Bearer | Current user's profile                              |
| PUT    | `/api/user`              | Bearer | Update name, phone number and/or profile image (multipart) |
| GET    | `/api/cities`            | No     | All cities with their 3-day plans                   |
| POST   | `/api/cities`            | Bearer | Add a city                                          |
| GET    | `/api/formcities/random` | No     | Six random cities for the itinerary form            |
| POST   | `/api/generate-itinerary`| No     | Generate an itinerary with OpenAI (rate limited)    |
| GET    | `/images/:file`          | No     | Static city images                                  |
| GET    | `/uploads/:file`         | No     | Uploaded profile images                             |

Authenticated routes expect `Authorization: Bearer <token>`.

### Example: generate an itinerary

```bash
curl -X POST http://localhost:5000/api/generate-itinerary \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Paris",
    "fromDate": "2026-06-01",
    "toDate": "2026-06-03",
    "companion": "Partner",
    "interests": ["Food", "Museums"],
    "budget": "medium"
  }'
```

```json
{ "itinerary": "Day 1 - 2026-06-01\nMorning: ..." }
```

Dates use `YYYY-MM-DD`, trips can be up to 14 days, and `budget` is `low`, `medium` or `high` (default `medium`).

## Getting started

1. Clone the repo and install dependencies:

   ```bash
   git clone https://github.com/tahmoor20/triptailorBackend.git
   cd triptailorBackend
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your own values:

   ```bash
   cp .env.example .env
   ```

   | Variable         | Required | Description                                          |
   | ---------------- | -------- | ---------------------------------------------------- |
   | `MONGO_URI`      | Yes      | MongoDB Atlas connection string                      |
   | `JWT_SECRET`     | Yes      | Long random string used to sign tokens               |
   | `OPENAI_API_KEY` | No       | Needed for `/api/generate-itinerary` (503 without it)|
   | `OPENAI_MODEL`   | No       | Defaults to `gpt-4o-mini`                            |
   | `DB_NAME`        | No       | Defaults to `triptailor`                             |
   | `PORT`           | No       | Defaults to `5000`                                   |
   | `BASE_URL`       | No       | Public URL of this server, used for image links      |
   | `JWT_EXPIRES_IN` | No       | Defaults to `7d`                                     |

   Generate a secret with `openssl rand -hex 32`. Never commit `.env`.

3. (Optional) load the sample cities:

   ```bash
   npm run seed
   ```

4. Start the server:

   ```bash
   npm start        # or: npm run dev   (restarts on file changes)
   ```

   The API runs at `http://localhost:5000`.

## Scripts

| Script          | What it does                         |
| --------------- | ------------------------------------ |
| `npm start`     | Start the server                     |
| `npm run dev`   | Start with automatic restarts        |
| `npm run seed`  | Insert or update the sample cities   |
| `npm test`      | Run the Jest test suite              |
| `npm run lint`  | Run ESLint                           |

## Project structure

```
.
├── index.js                 # Entry point: config, MongoDB, OpenAI client, server
├── src/
│   ├── app.js               # Express app factory (dependencies are injected)
│   ├── config.js            # Environment-based configuration
│   ├── validators.js        # Input validation
│   ├── middleware/          # auth (JWT), rate limiting, error handling
│   ├── routes/              # auth, user, cities, itinerary
│   ├── services/itinerary.js# Prompt building and the OpenAI call
│   └── utils/
├── data/cities.json         # Sample cities used by the seed script
├── scripts/seed.js
├── tests/                   # Jest + Supertest, with an in-memory fake database
└── images/                  # Static city images
```

## Notes

- Passwords are hashed with bcrypt and never returned by the API.
- The same error is returned for an unknown email and a wrong password.
- Itinerary generation is limited to 20 requests per 15 minutes per IP, and sign-in/sign-up to 50.
- Ticket prices in `data/cities.json` are approximate sample values in USD.
- `POST /api/cities` now requires a signed-in user.

## Author

Qamar Uddin - [LinkedIn](https://linkedin.com/in/its-qamar-uddin) · [GitHub](https://github.com/tahmoor20)
