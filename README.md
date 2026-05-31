<div align="center">

<img src="https://img.shields.io/badge/PrintDesk-Frontend-1a1a1a?style=for-the-badge&logoColor=white" alt="PrintDesk" />

# 🖨️ PrintDesk — Frontend

### Service Centre Management System
*A modern, full-stack web application for managing printer repair operations*

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![React Router](https://img.shields.io/badge/React_Router-v6-CA4245?style=flat-square&logo=reactrouter)](https://reactrouter.com)
[![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?style=flat-square&logo=axios)](https://axios-http.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Live Demo](#) · [Backend Repo](https://github.com/AlgoArchitect3005/printdesk-api-) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [API Integration](#-api-integration)
- [Contributing](#-contributing)

---

## 🧾 About

**PrintDesk** is a full-stack service centre management system built for printer repair businesses. It replaces manual paper-based job tracking with a clean, digital workflow — from customer walk-in to invoice generation.

> This repository contains the **React frontend**. The Spring Boot backend lives [here](https://github.com/AlgoArchitect3005/printdesk-api-).

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based secure login
- Role-based access control — `ADMIN` and `OPERATOR`
- Protected routes — unauthorized access automatically redirected

### 📋 Job Card Management
- Create job cards with customer + printer details
- Real-time status tracking — `RECEIVED → DIAGNOSING → WAITING_FOR_PARTS → REPAIRED → DELIVERED`
- Visual progress bar on job detail page
- Search & filter by status, customer name, phone, printer model

### 👥 Customer Management
- Search customer by phone number
- Auto-fill form if customer exists
- Create new customer on the fly during job creation

### 🧰 Inventory Management
- Track spare parts stock
- Low stock alerts on dashboard (Admin only)
- Parts linked directly to job cards

### 🧾 Invoice & Billing
- Auto-generate invoice on job completion
- Parts total + service charge = grand total
- Payment recording — `UNPAID`, `PARTIAL`, `PAID`

### 📊 Dashboard
- Active jobs, delivered, waiting for parts — live stat cards
- Recent jobs table (last 8)
- Status breakdown overview

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router DOM v6 |
| HTTP Client | Axios |
| Auth | JWT (localStorage) |
| Styling | Custom CSS (no Tailwind) |
| Charts | Recharts |
| Notifications | React Hot Toast |
| Icons | Lucide React |
| Mobile (Planned) | Capacitor (Android) |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

```bash
node >= 18.x
npm >= 9.x
```

> ⚠️ Backend must be running before starting the frontend. See [backend setup](https://github.com/AlgoArchitect3005/printdesk-api-).

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AlgoArchitect3005/printdesk-ui.git

# 2. Navigate to project directory
cd printdesk-ui

# 3. Install dependencies
npm install

# 4. Create environment file
cp .env.example .env

# 5. Start development server
npm run dev
```

App will be running at `http://localhost:5173`

---

## 📁 Project Structure

```
printdesk-ui/
├── public/
├── src/
│   ├── components/         # Reusable UI components
│   │   └── Layout.jsx      # Shared sidebar + wrapper
│   ├── context/
│   │   └── AuthContext.jsx # JWT auth state management
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── JobList.jsx
│   │   ├── JobNew.jsx
│   │   ├── JobDetail.jsx
│   │   ├── Customers.jsx
│   │   └── Inventory.jsx
│   ├── services/
│   │   └── api.js          # Axios instance + interceptors
│   ├── styles/
│   │   ├── variables.css   # Design tokens
│   │   ├── Dashboard.css
│   │   ├── Jobs.css
│   │   └── LoginPage.css
│   ├── App.jsx             # Routes + PrivateRoute + AdminRoute
│   └── main.jsx
├── .env.example
├── index.html
├── vite.config.js
└── package.json
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

> **Never commit `.env` to GitHub.** It is already in `.gitignore`.

For production:
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

---

## 📜 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🔗 API Integration

All API calls go through `src/services/api.js`:

```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

> Full API documentation available in the [backend repository](https://github.com/AlgoArchitect3005/printdesk-api-).

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#f4f3ef` (warm beige) |
| Card | `#ffffff` |
| Border | `#e0ddd6` |
| Primary | `#1a1a1a` (black) |
| Font — Body | DM Sans |
| Font — Mono | DM Mono |
| Border Radius | `10px` |

---

## 🤝 Contributing

Contributions are welcome!

```bash
# 1. Fork the repo
# 2. Create your branch
git checkout -b feature/your-feature

# 3. Commit changes
git commit -m "feat: add your feature"

# 4. Push to branch
git push origin feature/your-feature

# 5. Open a Pull Request
```

---

## 👤 Author

**Yash Gupta**
- GitHub: [@AlgoArchitect3005](https://github.com/AlgoArchitect3005)

---

<div align="center">

Made with ❤️ for PrintDesk

⭐ Star this repo if you found it helpful!

</div>
