# AI-Powered Smart To-Do List & Productivity Assistant

A mobile application that helps users manage daily tasks efficiently using artificial intelligence. Built with React Native (Expo) for the frontend and Node.js (Express) with MongoDB for the backend, powered by Groq Cloud AI for intelligent task generation, prioritization, and scheduling suggestions.

---

## Team

| Member | Role | Responsibilities |
|---|---|---|
| Yasas | Backend Developer | Database design, REST APIs, authentication, AI integration, notification logic, backend testing |
| Sanjaya | Frontend Developer | React Native mobile app, UI screens, API integration, navigation, AI-generated task display |
| Praveen | UI/UX Designer | Wireframes, mockups, color schemes, branding, Figma prototypes, user experience |

---

## Features

### Task Management
- Create, edit, delete, and view tasks
- Mark tasks as complete / pending
- Categorize tasks (Study, Work, Personal, Health)
- Assign due dates and priorities
- View today's tasks, weekly view, and all tasks with filters

### AI-Powered (via Groq Cloud)
- **AI Chat Assistant** — conversational interface to discuss tasks
- **Task Generation** — automatically creates tasks from natural language ("I have an assignment due tomorrow")
- **Smart Prioritization** — assigns High / Medium / Low priority based on deadlines and context
- **Productivity Suggestions** — personalized tips to improve workflow
- **Schedule Optimization** — suggests best times to complete tasks
- **Manual Task Review** — analyzes user-created tasks and recommends improvements

### Notifications
- Scheduled reminders at task due time
- Automatic repeat reminders every 5 minutes if unacknowledged
- "Noted" button to dismiss reminders
- Customizable reminder frequency

### Dashboard & Reporting
- Daily and weekly task views
- Progress tracking (completed vs pending)
- Productivity summary

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native 0.73 + Expo 50 |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose ODM |
| Authentication | JWT (JSON Web Tokens) + bcrypt |
| AI Service | Groq Cloud API (`mixtral-8x7b-32768`) |
| Notifications | Expo Notifications (push) |
| HTTP Client | Axios |
| Validation | Joi (backend), custom (frontend) |
| State Management | React Context API |
| Local Storage | AsyncStorage (auth tokens) |

---

## Project Structure

```
ToDoListPlanner/
├── backend/                      # Node.js + Express API server
│   ├── src/
│   │   ├── config/               # Database & environment configuration
│   │   ├── controllers/          # Request handlers
│   │   ├── middleware/            # Auth guard, error handler, validation
│   │   ├── models/               # Mongoose schemas (User, Task, Notification)
│   │   ├── routes/               # Express route definitions
│   │   ├── services/             # Business logic layer
│   │   └── utils/                # Helpers & logger
│   ├── server.js                 # Entry point
│   └── package.json
│
├── mobile/                       # React Native + Expo app
│   ├── src/
│   │   ├── assets/               # Images, fonts
│   │   ├── components/           # Reusable UI (TaskCard, Button, Input, etc.)
│   │   ├── constants/            # Colors, config, priority/category maps
│   │   ├── context/              # AuthContext, ThemeContext
│   │   ├── hooks/                # useTasks, useAuth, useNotifications
│   │   ├── navigation/           # Stack & Tab navigators
│   │   ├── screens/              # Auth, Dashboard, Tasks, AI Chat, Profile
│   │   ├── services/             # API client (Axios), notification service
│   │   └── utils/                # Date helpers, validators
│   ├── App.js                    # Entry point
│   └── package.json
│
└── README.md
```

---

## Architecture

### Backend Flow
```
Client → Express Routes → Middleware (auth, validation) → Controller → Service → MongoDB
                                                                       ↕
                                                                   Groq Cloud AI
```

### Frontend Navigation
```
App
├── AuthStack (unauthenticated)
│   ├── LoginScreen
│   └── RegisterScreen
│
└── MainTabs (authenticated)
    ├── Dashboard — today's tasks, progress bar
    ├── Tasks — all tasks, filters, FAB to create, Task Detail
    ├── AI Chat — chat interface, task generation from text
    └── Profile — user settings, reminder config, logout
```

### Data Flow
```
User Action → Screen → API Service (Axios) → Backend Route → Controller → Service → DB/AI
                    ↕                                                    ↕
               UI Update ← State Update ← ← ← ← ← ← ← ← ← ← JSON Response
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create new account (name, email, password) |
| POST | `/api/auth/login` | Login, returns JWT token |
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile (name, reminder frequency) |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | List all tasks (query: `?status=&category=&priority=`) |
| GET | `/api/tasks/today` | Tasks due today |
| GET | `/api/tasks/week` | Tasks due this week |
| GET | `/api/tasks/progress` | Completed / pending counts & percentage |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/status` | Toggle completed / pending |

### AI (Groq Cloud)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/chat` | Conversational chat with AI assistant |
| POST | `/api/ai/generate-tasks` | Generate tasks from natural language |
| POST | `/api/ai/prioritize` | Assign priorities to provided tasks |
| GET | `/api/ai/suggestions` | Productivity tips based on current tasks |
| POST | `/api/ai/review` | Review manual tasks for improvements |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get pending notifications |
| PUT | `/api/notifications/:id/acknowledge` | Acknowledge / dismiss a notification |

---

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Groq Cloud API key (free at https://console.groq.com)
- Expo CLI (`npm install -g expo-cli`)
- Android emulator / physical device (for mobile testing)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Mobile
cd ../mobile
npm install
```

### 2. Configure Environment

```bash
# Backend
cd backend
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todo-planner
JWT_SECRET=your_random_jwt_secret_here
JWT_EXPIRES_IN=7d
GROQ_API_KEY=gsk_your_actual_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

### 3. Start Backend Server

```bash
cd backend
npm run dev
```

Server starts at `http://localhost:5000`.

### 4. Start Mobile App

```bash
cd mobile
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS), or press `a` to open in an Android emulator.

**Note:** Update the API URL in `mobile/src/constants/config.js` if your backend runs on a different host. `10.0.2.2` is the Android emulator's alias for the host machine's `localhost`.

---

## Database Schema

### Users
| Field | Type | Notes |
|---|---|---|
| name | String | Required |
| email | String | Required, unique, lowercase |
| password | String | bcrypt hashed |
| reminderFrequency | Number | Minutes between repeat reminders (default: 5) |
| timestamps | Date | createdAt, updatedAt (auto) |

### Tasks
| Field | Type | Notes |
|---|---|---|
| user | ObjectId (ref: User) | Task owner |
| title | String | Required |
| description | String | Optional |
| category | Enum | study, work, personal, health, other |
| priority | Enum | high, medium, low |
| dueDate | Date | Optional deadline |
| status | Enum | pending, completed |
| isAIGenerated | Boolean | Whether created by AI |
| scheduleSuggestion | String | AI suggested time |
| timestamps | Date | Auto |

### Notifications
| Field | Type | Notes |
|---|---|---|
| user | ObjectId (ref: User) | Notification recipient |
| task | ObjectId (ref: Task) | Related task |
| title | String | Notification title |
| message | String | Notification body |
| scheduledAt | Date | When to notify |
| acknowledged | Boolean | Dismissed by user |
| acknowledgedAt | Date | When dismissed |
| sentCount | Number | Repeat counter (max 10) |
| active | Boolean | Whether still relevant |
| timestamps | Date | Auto |

---

## Development Plan

| Phase | Duration | Activities | Owner |
|---|---|---|---|
| Requirements | Week 1 | Gather requirements, define scope, project proposal | All |
| UI/UX Design | Week 1 | Wireframes, mockups, Figma prototypes | Praveen |
| Frontend Dev | Week 2–3 | All screens, navigation, API integration | Sanjaya |
| Backend Dev | Week 2–3 | Database, auth, task APIs, AI integration | Yasas |
| Notifications | Week 4 | Reminder scheduling, repeat logic, acknowledgment | Yasas |
| Testing | Week 4 | Unit, integration, user testing, bug fixing | All |
| Deployment | Week 5 | Final fixes, presentation, demonstration | All |
