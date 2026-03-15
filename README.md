# Quiz & Assessment Platform

## Overview
A full-stack educational web application that enables instructors to create timed quizzes and participants to join live sessions via a unique code. Features a real-time leaderboard and downloadable PDF score reports.

## Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Redux Toolkit, React Query, SockJS/STOMP
- **Backend:** Spring Boot 3, Spring WebSockets + STOMP, Spring Data JPA, Spring Security (JWT)
- **Database:** PostgreSQL
- **PDF Generation:** iText 5

## Prerequisites
- Docker and Docker Compose

## Getting Started

1. Clone the repository.
2. Ensure Docker daemon is running.
3. Run `docker-compose up --build -d`

The services will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080/api`

## Environment Variables
The following environment variables can be customized in a `.env` file at the root level, though defaults are provided in `docker-compose.yml`:
- `DB_HOST` (default: postgres)
- `DB_PORT` (default: 5432)
- `DB_NAME` (default: quiz_db)
- `DB_USER` (default: postgres)
- `DB_PASSWORD` (default: postgres)
- `JWT_SECRET` (default: a 256-bit hex string)
- `VITE_API_BASE_URL` (Frontend build arg)
- `VITE_WS_URL` (Frontend build arg)

## Implementation Details
- Instructor Authentication: JWT based, 24 hour expiry.
- Participant Join: Generates temporary user account and 2-hour JWT.
- WebSocket Leaderboard: Listens on `/topic/session.{sessionId}.leaderboard`. Updates pushed from backend upon attempt submission.
- Validation: Time limit enforced server-side with 30-second grace period.
