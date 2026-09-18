# 📋 Anveshak Attendance Manager

A production-quality attendance & notification management system built for the **Anveshak Technical Team**. Coordinators manage student rosters, record session attendance, and trigger automated email alerts to absentees — while the HOD gets real-time analytics and reports.

> **Developed by Sahil Irshad**

---

## ✨ Features

### 🔐 Authentication & Role-Based Access
- **Coordinator** — Full control: manage students, create sessions, mark attendance, submit & lock sessions, retry failed emails.
- **HOD (Head of Department)** — Read-only oversight: view analytics dashboards, low-attendance alerts, daily/monthly summaries, and audit logs.
- Secure httpOnly cookie-based JWT with short-lived access tokens (15 min) and refresh token rotation.
- Password reset via single-use email tokens.
- Rate-limiting, Helmet CSP, and CORS isolation.

### 👥 Student Roster Management
- Add, update, search, and filter students.
- Track metadata: registration number, email, phone, department, semester, year, team.
- Soft-deactivation to preserve historical records.

### 📋 Attendance Tracking & Verification
- Create sessions with date, time window, title, and topic.
- Interactive present/absent toggles with "Mark All" controls.
- Sticky summary bar with real-time percentage calculation.
- **Session locking** — prevents unauthorized modifications after submission.
- **Attendance corrections** — with mandatory audit reasons.
- **Duplicate prevention** — compound Mongoose index guarantees data integrity.

### 📧 Automated Email Notifications
- Styled HTML emails sent to absent students upon session submission.
- HOD summary reports with attendance stats and absent roster.
- Failure-tolerant background email worker — submission succeeds even if SMTP fails.
- Notification logs with one-click manual retry for failed emails.

### 📊 HOD Reports & Analytics
- Monthly & daily attendance breakdowns with threshold indicators.
- Low-attendance alerts for students below the configurable threshold (default: 75%).
- Interactive charts via **Recharts** (bar charts for trends, pie charts for distribution).
- One-click **CSV export** for record-keeping.

### 📜 Audit Logging
- Complete trail of logins/logouts, student CRUD, attendance submissions, corrections, and email dispatch status.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19 (Vite), Vanilla CSS (Custom Design System), Lucide Icons, Recharts, Axios, React Router v7, React Hook Form, React Hot Toast |
| **Backend** | Node.js, Express.js, JWT (httpOnly cookies), Bcryptjs, Express-Validator, Rate-Limiter, Helmet, CORS, Morgan |
| **Database** | MongoDB (Mongoose ODM) + Embedded `MongoMemoryServer` fallback for zero-config development |
| **Email** | Nodemailer with styled responsive HTML templates |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **npm** v9+
- MongoDB *(optional — app auto-starts an in-memory server if not available)*

### 1. Clone the Repository
```bash
git clone https://github.com/shahsahil607u-collab/Attendance-Manager.git
cd Attendance-Manager
```

### 2. Configure Environment
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env — enable demo seed for development:
# ENABLE_DEMO_SEED=true
```

### 3. Launch (Single Command)
```bash
npm run dev
```

This starts:
| Service | URL |
|---|---|
| Frontend (Vite) | `http://localhost:5173` |
| Backend (Express) | `http://localhost:5001` |
| MongoDB | Auto-detected or embedded in-memory server |

### 4. Demo Credentials (Development Only)

> ⚠️ Only available when `ENABLE_DEMO_SEED=true` in `backend/.env`.

| Role | Email | Password |
|---|---|---|
| Coordinator | `coordinator@techteam.edu` | `coordinator123` |
| HOD | `agcmscshod@gmail.com` | `Anveshak@5271` |

---

## 📁 Project Structure

```
Attendance-Manager/
├── backend/
│   ├── config/          # MongoDB connection & Memory Server fallback
│   ├── controllers/     # Auth, Student, Session, Attendance, Report, Notification, AuditLog
│   ├── middleware/      # Auth, RBAC, error handler, rate limiter
│   ├── models/          # Mongoose schemas (User, Student, Session, Attendance, Notification, AuditLog, Setting)
│   ├── routes/          # Express API route modules
│   ├── seed/            # Demo data seed script
│   ├── services/        # Business logic (Email, Notification, Audit)
│   ├── templates/       # HTML email templates (absent alert & HOD report)
│   ├── utils/           # Utility helpers
│   ├── validators/      # Express-validator schemas
│   └── server.js        # Application entry point
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── attendance/  # Attendance marking UI widgets
│       │   ├── charts/      # Recharts wrappers
│       │   ├── common/      # Shared UI components & modals
│       │   ├── layout/      # App layout, sidebar, navbar
│       │   └── students/    # Student list & profile widgets
│       ├── context/     # AuthContext — state & cookie-based session management
│       ├── hooks/       # Custom React hooks
│       ├── pages/       # Route-level pages
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Students.jsx
│       │   ├── StudentProfile.jsx
│       │   ├── Sessions.jsx
│       │   ├── SessionDetail.jsx
│       │   ├── MarkAttendance.jsx
│       │   ├── Reports.jsx
│       │   ├── Notifications.jsx
│       │   ├── AuditLogs.jsx
│       │   └── AttendanceHistory.jsx
│       ├── services/    # Axios API client with auto token refresh
│       ├── utils/       # Date formatters, color helpers
│       ├── index.css    # Custom CSS Design System
│       ├── App.jsx      # Root component & routing
│       └── main.jsx     # React entry point
│
├── package.json         # Root — single-command dev start
└── README.md            # Project documentation
```

---

## 🌐 API Reference

### Authentication — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate & receive session cookies |
| `POST` | `/api/auth/refresh` | Refresh expired access token |
| `POST` | `/api/auth/logout` | Clear session & invalidate refresh token |
| `GET` | `/api/auth/me` | Get current user profile |
| `POST` | `/api/auth/forgot-password` | Send password reset email |
| `POST` | `/api/auth/reset-password` | Reset password with token |

### Students — `/api/students`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/students` | List students (search, pagination, filter) | All |
| `POST` | `/api/students` | Create new student | Coordinator |
| `GET` | `/api/students/:id` | Get student details | All |
| `PUT` | `/api/students/:id` | Update student | Coordinator |
| `PATCH` | `/api/students/:id/deactivate` | Toggle active status | Coordinator |

### Sessions — `/api/sessions`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/sessions` | List attendance sessions | All |
| `POST` | `/api/sessions` | Create session | Coordinator |
| `GET` | `/api/sessions/:id` | Get session details & roster | All |
| `POST` | `/api/sessions/:id/submit` | Lock session & trigger notifications | Coordinator |

### Attendance — `/api/attendance`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/attendance/mark` | Bulk mark attendance | Coordinator |
| `POST` | `/api/attendance/correction` | Correct record with reason | Coordinator |

### Reports — `/api/reports`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reports/daily` | Daily attendance stats |
| `GET` | `/api/reports/monthly` | Monthly stats & threshold check |
| `GET` | `/api/reports/student/:studentId` | Individual student stats |
| `GET` | `/api/reports/export` | Export report to CSV |

### Notifications & Audit
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/notifications` | View notification logs | All |
| `POST` | `/api/notifications/:id/retry` | Retry failed notification | Coordinator |
| `GET` | `/api/audit-logs` | View system audit logs | All |

### System
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check with DB status |

---

## 🚢 Deployment

### Backend on Render
1. Create a **Web Service** connected to your GitHub repo.
2. Configure:
   | Setting | Value |
   |---|---|
   | **Build Command** | `npm install` |
   | **Start Command** | `npm run start:backend` |
3. Add environment variables in the Render dashboard:
   - `NODE_ENV=production`
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a strong random secret
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `FROM_EMAIL`
   - `HOD_EMAIL`
   - `FRONTEND_URL` — your deployed frontend URL

### Frontend on Vercel / Netlify
1. Set the **Root Directory** to `frontend/`.
2. Build command: `npm run build`
3. Output directory: `dist/`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  <strong>Built with ❤️ by Sahil Irshad for the Anveshak Technical Team</strong>
</p>
