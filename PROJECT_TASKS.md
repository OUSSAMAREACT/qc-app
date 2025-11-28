# Project Tasks & Status

## Project Context
- **Hosting:** Hostinger VPS with Coolify
- **Frontend:** React (Vite)
- **Backend:** Node.js (Express)
- **Database:** PostgreSQL (Prisma)

## ✅ Completed Tasks

### Authentication & User Management
- [x] **Implement Confirmation Email on Registration**
    - Setup Nodemailer with Brevo/Resend
    - Create French email templates
- [x] **Fix 'Forgot Password' Feature**
    - Ensure emails are sent in French
- [x] **Implement Super Admin Role**
    - Protect routes (User Management, Settings)
    - Auto-promote specific email to Super Admin
    - Auto-promote specific email to Super Admin
    - Hide admin features for normal admins
- [x] **Onboarding & Freemium Access**
    - [x] **Freemium Model:** New users are ACTIVE but restricted to Free modules
    - [x] **Profile Setup:** Mandatory step (City, Hospital, Gender, Phone)
    - [x] **Registration Hardening:** Strict email & password validation

### UI/UX Improvements
- [x] **Premium UI/UX Upgrade**
    - Mobile Responsive Admin Dashboard
    - Glassmorphism Mobile Menu
    - Homepage (LandingPage) Overhaul
    - Dashboard UI Consistency
- [x] **Mobile Optimization**
    - Reduce padding/margins on QuizPage & WeeklyExamPage
    - Optimize ResultPage for mobile
- [x] **Polish & Fixes**
    - Custom Favicon
    - Dynamic question count on homepage
    - Fix Mixed Content (HTTP/HTTPS) errors

### Features
- [x] **Bulk Import Questions**
    - Support CSV and Google Forms JSON
    - "Najib Strategy" for answer mapping
- [x] **Question Bank Management**
    - Move questions between categories
    - Batch delete
- [x] **Spell Check Feature**
    - Integration with `nspell` and `dictionary-fr`
    - "Ignore" word functionality
    - Admin UI for spell check
- [x] **Notification System**
    - Real-time alerts for comments
    - Notification Bell in Navbar
- [x] **AI Text-to-Speech (TTS)**
    - Gemini 2.5 Flash integration
    - Multi-speaker support (Male/Female)
    - Prefetching for low latency
    - Fix "Ghost Audio" and race conditions

### Payment Workflow (Manual Bank Transfer)
- [x] **Frontend:** Create PaymentPage (RIB Display)
- [x] **Frontend:** Redirect PENDING users to PaymentPage on login
- [x] **Backend:** Update authController to allow login for PENDING users (restricted access)

## 🚧 Pending / Future Tasks

### Payment Workflow (Freemium Upgrade)
- [x] **Backend:** Create Payment Model & Controller (Upload, List, Approve)
- [x] **Frontend:** Add "Upload Receipt" to PaymentPage
- [x] **Frontend:** Create Admin Payment Verification View
- [x] **Logic:** Auto-promote user to PREMIUM role upon approval

### Admin View Optimization
- [x] **CommonModulesView:** Convert to Responsive Grid & Cards
- [x] **SpecialtyView:** Convert to Responsive Grid & Cards
- [x] **CategoryDetailView:** Improve Question Management UI
- [x] **WeeklyExamManager:** Improve Exam Creation Flow

### Other
- [ ] **Optimize Mobile Question UI:** Further refinements if needed
