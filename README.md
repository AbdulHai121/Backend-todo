# Todo Backend — Quick Start

## Requirements
- Node.js (>=18)
- MySQL server

## Setup
1. Copy `.env.example` to `.env` and fill in values.
2. Install dependencies:
   ```bash
   cd server
   npm install
   ```
3. Generate Prisma client and run migration:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. Run dev server:
   ```bash
   npm run dev
   ```

## API Endpoints
- POST `/api/auth/register` { name, email, password }
- GET `/api/auth/verify?token=...&email=...`
- POST `/api/auth/login` { email, password }

Protected (Authorization: Bearer <token>):
- GET `/api/todos` - list
- POST `/api/todos` { title, detail }
- GET `/api/todos/:id`
- PUT `/api/todos/:id` { title?, detail?, completed? }
- DELETE `/api/todos/:id