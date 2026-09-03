# Technical Team Attendance & Notification Management System

A production-quality administrative web application built for college technical teams to manage student rosters, record session attendance, trigger automated absent student notifications, and generate comprehensive HOD analytics.

---

## 🌟 Key Features

### 🔐 1. Authentication & Role-Based Access Control (RBAC)
- **Coordinator Role**: Full operational privileges to manage student rosters, create attendance sessions, mark and submit attendance, perform corrections, and retry failed notifications.
- **HOD (Head of Department) Role**: Read-only oversight access to view high-level analytics, low-attendance alerts, daily/monthly summaries, and audit logs.
- **Security**: Passwords hashed with `bcryptjs`, session security via JWT, HTTP security headers using `Helmet`, CORS isolation, and rate-limiting on sensitive endpoints.

### 👥 2. Student Roster Management
- Add, update, search, and filter technical team students.
- Track student metadata (roll number, email, phone, department, semester, year, team).
- Soft-deactivation feature to maintain historical records for departed students.

### 📋 3. Attendance Tracking & Verification
- Create attendance sessions with date, time window, title, and topic.
- Interactive attendance marking interface with present/absent toggles, "Mark All Present/Absent" controls, and real-time calculation of statistics.
- Sticky summary bar with instant percentage calculation and submission modal.
- **Session Locking**: Once submitted, session attendance is locked to prevent unauthorized modifications.
- **Attendance Corrections**: Coordinator can correct attendance with mandatory audit reasons.
- **Duplicate Prevention**: Mongoose compound index `{ sessionId: 1, studentId: 1 }` guarantees data integrity.

### 📧 4. Non-Blocking Automated Email Notifications
- Sends styled HTML emails to absent students immediately upon session submission.
- Sends HOD summary reports containing attendance statistics and absent roster.
- Failure-tolerant background email worker via Nodemailer—attendance submission succeeds even if SMTP fails.
- Notification logs page with failure reasons and a one-click manual retry button for failed emails.

### 📊 5. HOD Reports & Analytics
- Monthly & Daily attendance breakdown with attendance threshold indicators.
- Low attendance alert list highlighting students falling below configurable threshold (default: 75%).
- Responsive visual charts built with `Recharts` (bar charts for session trends, pie charts for present/absent distribution).
- One-click CSV Export for administrative record-keeping.

### 📜 6. System Audit Logging
- Complete audit trail tracking user logins/logouts, student creation/updates, attendance submissions, corrections, and email dispatch status.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React (Vite), Vanilla CSS (Custom Design System), Lucide Icons, Recharts, Axios, React Router v6 |
| **Backend** | Node.js, Express.js, JWT, Bcryptjs, Express-Validator, Rate-Limiter-Flexible, Helmet, Cors |
| **Database** | MongoDB (Mongoose ORM) + Embedded `MongoMemoryServer` fallback for instant out-of-the-box running |
| **Email** | Nodemailer with styled responsive HTML email templates |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Launch the Application
Run the root start command:
```bash
npm run dev
```

This single command starts:
1. **Backend Server** on `http://localhost:5001`
2. **Frontend App** on `http://localhost:5173`
3. **Embedded MongoDB Server** (automatically initialized and seeded with demo data if local MongoDB is not running).

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Coordinator** | `coordinator@techteam.edu` | `coordinator123` | Full Access (Create, Mark, Submit, Edit, Retry) |
| **HOD** | `hod@techteam.edu` | `hod123456` | Read-Only Oversight & Analytics |

---

## 📁 Project Architecture

```
Attendance Manager Antigravity/
├── backend/
│   ├── config/          # MongoDB connection & Memory Server fallback
│   ├── controllers/     # Controller layer (Auth, Student, Session, Attendance, Report, Notification, AuditLog)
│   ├── middleware/      # Auth, RBAC authorization, error handler, rate limiter, validators
│   ├── models/          # Mongoose Schemas (User, Student, Session, Attendance, Notification, AuditLog, Setting)
│   ├── routes/          # Express API route modules
│   ├── seed/            # Seed script for initial demo data
│   ├── services/        # Business logic services (Email, Notification, Audit)
│   ├── templates/       # HTML email templates (Absent alert & HOD report)
│   ├── validators/      # Express-validator schemas
│   └── server.js        # Express application entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Layout, common UI widgets, modals, stat cards
│   │   ├── context/     # AuthContext for state & JWT management
│   │   ├── pages/       # Login, Dashboard, Students, StudentProfile, Sessions, MarkAttendance, SessionDetail, Reports, Notifications, AuditLogs
│   │   ├── services/    # Axios API client with auth interceptors
│   │   ├── utils/       # Date formatters, color calculators, helper utilities
│   │   └── index.css    # Custom CSS Design System
│   ├── index.html       # HTML root entry point
│   └── vite.config.js   # Vite bundle configuration
├── package.json         # Root package file for single-command start (`npm run dev`)
└── README.md            # Project documentation
```

---

## 🌐 API Endpoint Summary

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Authenticate user & receive JWT
- `POST /api/auth/logout` - Clear user session
- `GET  /api/auth/me` - Get current user profile

### Students (`/api/students`)
- `GET    /api/students` - List students (supports search, pagination, active filter)
- `POST   /api/students` - Create new student (*Coordinator only*)
- `GET    /api/students/:id` - Get student details
- `PUT    /api/students/:id` - Update student details (*Coordinator only*)
- `PATCH  /api/students/:id/deactivate` - Toggle student active status (*Coordinator only*)

### Sessions (`/api/sessions`)
- `GET  /api/sessions` - List attendance sessions
- `POST /api/sessions` - Create session (*Coordinator only*)
- `GET  /api/sessions/:id` - Get session details & attendance roster
- `POST /api/sessions/:id/submit` - Lock session & trigger notifications (*Coordinator only*)

### Attendance (`/api/attendance`)
- `POST /api/attendance/mark` - Bulk mark session attendance (*Coordinator only*)
- `POST /api/attendance/correction` - Correct attendance record with reason (*Coordinator only*)

### Reports & Analytics (`/api/reports`)
- `GET /api/reports/daily` - Daily attendance stats
- `GET /api/reports/monthly` - Monthly attendance stats & threshold check
- `GET /api/reports/student/:studentId` - Individual student attendance statistics
- `GET /api/reports/export` - Export report data to CSV

### Notifications & Audit (`/api/notifications`, `/api/audit-logs`)
- `GET  /api/notifications` - View notification logs
- `POST /api/notifications/:id/retry` - Retry failed notification (*Coordinator only*)
- `GET  /api/audit-logs` - View system audit logs
# Attendance-Manager
# Full-Stack-Attendance-Manager
