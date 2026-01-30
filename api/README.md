# Property Parcels API

A backend API built with Hono.js and PostgreSQL.

## Features

- Fast web framework with Hono.js
- Direct PostgreSQL connection without ORM
- TypeScript support

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up PostgreSQL database and create a database named `property_parcels`.

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials.

4. Run the development server:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000` (or check the output).

## Build

```bash
npm run build
npm start
```

## API Endpoints

- `GET /` - Welcome message
- `GET /parcels` - Fetch parcels from database (example)