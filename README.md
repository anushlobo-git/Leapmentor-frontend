# LeapMentor Frontend

This is the React frontend for LeapMentor, the mentorship platform that connects mentees with mentors for discovery, booking, communication, and progress tracking.

## Overview

The frontend provides:

- User authentication and onboarding screens
- Mentor discovery and search experience
- Booking and availability flow
- Real-time chat and notifications
- Mentor and mentee dashboards
- Admin views for platform management

## Tech Stack

- React 19
- Vite 7
- Redux Toolkit
- React Router
- Tailwind CSS
- Socket.IO client
- Recharts for analytics dashboards

## Project Structure

```text
src/
├── app/
├── components/
├── pages/
├── services/
├── store/
├── utils/
└── main.jsx
```

## Prerequisites

Before running the frontend, make sure:

- Node.js 18 or newer is installed
- The backend server is running and reachable

## Installation

```bash
cd Leapmentor-frontend
npm install
```

## Environment Variables

Create a `.env` file in the frontend root with values in the following format.

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

## Run Locally

```bash
npm run dev
```

The development server will typically start at `http://localhost:5173`.

## Build for Production

```bash
npm run build
```

## Linting

```bash
npm run lint
```

## Notes

- Do not commit real API keys or secrets in the frontend environment file.
- The frontend expects the backend to be available on the configured API and socket URLs.
