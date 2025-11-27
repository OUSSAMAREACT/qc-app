# QCMEchelle11 - Developer Guide & Project Documentation

This document serves as the "Source of Truth" for the QCMEchelle11 project. It outlines how the application is structured, how to run it, and critical implementation details that must be preserved.

## 🛠 Tech Stack

### Frontend (`/client`)
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS (Premium UI/UX, Glassmorphism)
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **State Management:** React Context (`AuthContext`, `ThemeContext`)
- **Routing:** React Router DOM (with `ScrollToTop` component)
- **HTTP Client:** Axios

### Backend (`/server`)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Email:** Nodemailer (SMTP)

## 🚀 How to Run Locally

The project is split into two parts: Client and Server. You need to run both.

### 1. Database Setup
Ensure your `.env` file in `/server` is configured correctly.
```bash
cd server
npx prisma db push  # Sync schema with DB
npx prisma db seed  # (Optional) Seed initial data
```

### 2. Start the Backend
Runs on **Port 5001**.
```bash
cd server
npm run dev
```

### 3. Start the Frontend
Runs on **Port 5173** (usually).
```bash
cd client
npm run dev
```

## 🏗 Architecture & Key Features

### Authentication & Roles
- **Roles:** `USER`, `ADMIN`, `SUPER_ADMIN`.
- **Super Admin:** Has exclusive access to `UserManager` (promote/demote/delete) and `SettingsManager`.
- **Middleware:** `authMiddleware.js` handles JWT verification. `requireAdmin` and `requireSuperAdmin` enforce roles.
- **Persistence:** The `SUPER_ADMIN` role is hardcoded/enforced in `authController.js` for specific emails (e.g., `oussamaqarbach@gmail.com`) to prevent lockout.

### Quiz System
- **Randomization:**
  - **Questions:** Shuffled by the backend.
  - **Answers:** Shuffled by the backend in `quizController.js` (Choices A, B, C, D order changes).
  - **Hint Removal:** The text `(Plusieurs réponses)` is automatically stripped from questions by the backend.
- **Text-to-Speech (TTS):**
  - Implemented in `QuizPage.jsx` using `window.speechSynthesis`.
  - **Voice:** Prioritizes "Google Français" or any French voice.
  - **Behavior:** Stops automatically when navigating between questions (`useEffect` cleanup).

### Landing Page
- **Content:** Dynamic content fetched from `echelle11.com` (hardcoded/integrated into `LandingPage.jsx`).
- **SEO:** `SEO.jsx` component handles meta tags.
- **Dynamic Year:** Uses `{new Date().getFullYear()}` for copyright and content dates.

## ⚠️ Critical Rules for Future Development

1.  **Do NOT Break Super Admin Access:**
    - Always ensure `requireSuperAdmin` middleware is used for sensitive routes (User deletion, System settings).
    - Do not remove the auto-promotion logic in `authController.js`.

2.  **Maintain Premium UI/UX:**
    - Use **Tailwind CSS** for styling.
    - Stick to the "Glassmorphism" aesthetic (translucent backgrounds, blurs).
    - Ensure Dark Mode compatibility for all new components.

3.  **Quiz Integrity:**
    - **Never** send the `isCorrect` flag for choices to the frontend during the quiz. It must only be checked on the backend during submission.
    - Keep the answer shuffling logic in `quizController.js`.

4.  **Navigation:**
    - The `ScrollToTop` component in `App.jsx` is essential. Do not remove it. It ensures the page scrolls to the top on every route change.

5.  **Deployment:**
    - The project is deployed via Git push to `main`.
    - Ensure `client/dist` build works before pushing (`npm run build` in client).

## 📂 Important File Paths

- **Routes:** `client/src/App.jsx`
- **Auth Logic:** `server/src/controllers/authController.js`
- **Quiz Logic:** `server/src/controllers/quizController.js`
- **Frontend Quiz:** `client/src/pages/QuizPage.jsx`
- **Database Schema:** `server/prisma/schema.prisma`
- **Seed Data:** `server/prisma/seed.js`

---
*Last Updated: November 2025*
