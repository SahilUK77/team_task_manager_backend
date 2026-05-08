# Task Manager Backend

This folder contains the backend API for the Task Manager application.
It provides secure authentication, project and task endpoints, chat messaging, and team membership handling.

## What it does
- Authenticates users via signup and login
- Issues JWT tokens for protected routes
- Manages projects and tasks for authenticated users
- Supports task status updates and team-based task visibility
- Supports team creation, membership, and team chat messaging

## Key files
- `server.js` — Express server entrypoint and route mounting
- `config/db.js` — MySQL database connection setup
- `config/schema.js` — Database schema file to create tables in database
- `middleware/authMiddleware.js` — JWT verification and admin authorization
- `routes/auth.js` — authentication endpoints
- `routes/project.js` — project CRUD endpoints
- `routes/task.js` — task creation, listing, and status updates
- `routes/team.js` — team creation, membership, and team queries
- `routes/chat.js` — team chat message send and retrieval
- `schema.sql` — database schema and table definitions

## How it works
- Uses `dotenv` to load environment variables from `.env`
- Uses `mysql2` for database queries
- Uses `bcrypt` to hash passwords
- Uses `jsonwebtoken` to generate and validate JWT tokens
- Protects routes with `verifyToken`
- Restricts admin flows with `isAdmin`

## API Endpoints
- `POST /auth/signup` — create a new user
- `POST /auth/login` — login and receive JWT token
- `GET /projects` — list projects for the authenticated user
- `POST /projects` — create a project
- `GET /tasks` — get tasks for the user’s teams
- `POST /tasks` — create a new task
- `PUT /tasks/:id` — update task status
- `GET /chat/:teamId` — fetch messages for a team
- `POST /chat` — send a team message
- `GET /teams` — get teams where the user is a member
- `POST /teams` — create a new team (admin only)
- `POST /teams/add-member` — add a member to a team

## Setup Instructions
### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Create `.env`
```env
PORT=5000
DATABASE_URL=mysql://<user>:<password>@<host>:<port>/<database>
JWT_SECRET=your-secret-key
```

### 3. Run the server
```bash
npm start
```

### 4. Verify the API
Visit `http://localhost:5000/` to confirm the backend is running.

## Notes
- The backend uses `verifyToken` to protect all data routes.
- The database connection uses `process.env.DATABASE_URL`.
- Team membership is validated before returning tasks and chat messages.
- Create the database schema with `schema.sql` before running the app.

## Improvements
- Add validation middleware for request bodies
- Add pagination for tasks and projects
- Add better error logging and structured API responses
- Add real-time chat with WebSockets
