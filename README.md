# TaskFlow

![TaskFlow](/path/to/screenshot.png)

> **Live Demo:** [Insert Railway URL here]
> **Repository:** [Insert GitHub Repo here]

TaskFlow is a modern, full-stack Team Task Manager application built to streamline project management, team collaboration, and task tracking. Featuring role-based access control, real-time activity feeds, dynamic Kanban boards, and a beautiful SaaS UI.

## Tech Stack

| Domain | Technology | Description |
|---|---|---|
| **Frontend** | React + Vite | Fast, modern client with functional components & hooks |
| **Styling** | Tailwind CSS | Utility-first CSS framework tailored for pristine SaaS visuals |
| **Backend** | Node.js + Express | Robust REST API |
| **Database** | PostgreSQL | Relational database |
| **ORM** | Prisma | Typesafe database access |
| **Auth** | JWT + bcrypt | Secure authentication & password hashing |
| **Charts** | Recharts | Dynamic task status visualization |

## Default Demo Credentials

You can log in to the platform utilizing the seeded database credentials to test role restrictions.

| User Role | Email | Password |
|---|---|---|
| **Admin** | `admin@taskflow.com` | `Admin@123` |
| **Admin** | `sara@taskflow.com` | `Admin@123` |
| **Member** | `john@taskflow.com` | `Member@123` |

## Local Setup

**1. Clone and Install Dependencies**
```bash
# Install root (concurrently), client, and server dependencies
npm install
cd server && npm install
cd ../client && npm install
```

**2. Setup Environment Variables**
Copy the `.env.example` files in both `/server` and `/client` to `.env`.
Update the `/server/.env` with your local PostgreSQL `DATABASE_URL` and a secret string for JWTs.

**3. Database Initialization**
```bash
cd server
# Generate the Prisma client
npx prisma generate
# Push the schema to your database
npx prisma migrate dev
# Seed the database with demo users, projects, and tasks
npm run seed
```

**4. Start the Application**
```bash
# From the root directory, this runs both backend and frontend simultaneously
npm run dev
```

## API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Authenticate & get JWT | No |
| `GET` | `/api/projects` | Get projects user is a member of | Yes |
| `POST` | `/api/projects` | Create a new project | Yes (Admin) |
| `GET` | `/api/dashboard/stats` | Fetch aggregated dashboard metrics | Yes |
| `GET` | `/api/dashboard/activity` | Fetch recent activity log | Yes |
| `GET` | `/api/users` | List all workspace users | Yes (Admin) |

## Role Permissions

| Feature | ADMIN | MEMBER |
|---|---|---|
| Create Projects | ✅ | ❌ |
| Delete Projects | ✅ | ❌ |
| Manage Project Members | ✅ | ❌ |
| Manage Workspace Team | ✅ | ❌ |
| View Assigned Projects | ✅ | ✅ |
| Create & Update Tasks | ✅ | ✅ |
| Post Comments | ✅ | ✅ |
