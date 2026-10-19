# TripTailor Backend

REST API for **TripTailor**, a mobile travel-itinerary app. It serves city data from MongoDB Atlas and static city images to the React Native client.

> Frontend repo: _add link here_

## Tech stack

- Node.js, Express.js
- MongoDB Atlas (official `mongodb` driver)
- dotenv, CORS

## API endpoints

| Method | Endpoint      | Description                          |
| ------ | ------------- | ------------------------------------ |
| GET    | `/`           | Health check                         |
| GET    | `/api/cities` | Returns all cities from MongoDB      |
| POST   | `/api/cities` | Adds a new city (JSON body)          |
| GET    | `/images/:file` | Serves static city images          |

Data is stored in the `triptailor` database, `cities` collection.

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

   | Variable    | Description                          |
   | ----------- | ------------------------------------ |
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `PORT`      | Server port (default `5000`)         |

3. Start the server:

   ```bash
   node index.js
   ```

   The API runs at `http://localhost:5000`.

## Example request

```bash
curl http://localhost:5000/api/cities
```

## Project structure

```
.
├── index.js         # Express server and routes
├── images/          # Static city images
├── .env.example     # Environment variable template
└── package.json
```

## Author

Qamar Uddin - [LinkedIn](https://linkedin.com/in/its-qamar-uddin)
