# StudyMate BD (প্ল্যান করো নির্ভুল, পড়ো স্মার্টলি)

**StudyMate BD** is a modern, responsive, mobile-first Student Study Planner web application built for Bangladeshi students (HSC, SSC, College, University, and Job Aspirants). It works smoothly on mobile devices (including Android Chrome) as well as desktop and tablet screens.

---

## 🌟 Key Features

1. **ড্যাশবোর্ড (Dashboard)**:
   - Dynamic greeting & localized date in Bengali & English.
   - Real-time study streak calculation based on actual study sessions.
   - Today's routine timeline, urgent tasks, and upcoming exams.
   - 7-day mini study progress chart.
2. **বিষয়সমূহ (Subject Management)**:
   - Full CRUD (Create, Read, Update, Delete) with color palette selector.
   - Tracks total tasks and total study hours per subject.
   - Deletion safety checks.
3. **টাস্ক ও অ্যাসাইনমেন্ট (Tasks & Homework)**:
   - Title, description, subject, deadline date, optional time, estimated minutes.
   - Priority levels (High, Medium, Low) with badges.
   - Instant filtering (All, Due Today, Pending, Overdue, Completed) and search.
   - Sorting by deadline, priority, or creation date.
4. **সাপ্তাহিক রুটিন (Weekly Study Routine)**:
   - Timetable formatted for Saturday through Friday.
   - Automated collision detection warning for overlapping time slots.
5. **পরীক্ষার কাউন্টডাউন (Exam Countdown)**:
   - Calendar-accurate countdown days remaining.
   - "আজ পরীক্ষা!" (Exam Today!) highlight.
   - Separation of upcoming and past exams with zero negative countdowns.
6. **পোমোডোরো ফোকাস টাইমার (Focus Timer)**:
   - 25-minute focus session, 5-minute short break, 15-minute long break.
   - **Drift-safe timestamp logic** using `Date.now()` to ensure accurate timing during background tabs or mobile sleep.
   - Audio completion chime using Web Audio API.
   - Automatically logs completed focus sessions to database/local records.
7. **পড়াশোনার বিশ্লেষণ (Study Analytics)**:
   - Accurate calculations from real session logs.
   - Past 7 days SVG study trend chart.
   - Time spent distribution by subject.
8. **সেটিংস ও ডেটা ব্যাকআপ (Settings & Data Portability)**:
   - Full Bengali (বাংলা) and English language toggle.
   - Light mode and Dark mode.
   - JSON export and import with schema verification.
   - Mobile-friendly Supabase cloud credential manager.

---

## 📱 Mobile-First Architecture

- **Primary mobile navigation**: Bottom navigation bar with direct access to Dashboard, Tasks, Timer, Routine, Exams, and a slide-up "More" drawer for Subjects, Analytics, and Settings.
- **Desktop/Tablet navigation**: Clean sidebar with real-time task counts and upcoming exam badges.
- **Dual Mode**:
  - **Local Demo Mode**: Works immediately on Android Chrome without any account or API keys. Stores data locally in browser storage.
  - **Cloud Mode (Supabase)**: Connects to a free Supabase PostgreSQL database with Row Level Security (RLS) and Email/Password Authentication.

---

## 🗄️ Database Architecture (Supabase PostgreSQL)

The database schema is located in `supabase/schema.sql`. It includes:

| Table | Description |
|---|---|
| `public.profiles` | User profiles with study targets and preferred language |
| `public.subjects` | Academic subjects with color codes and descriptions |
| `public.tasks` | Homework, assignments, priorities, and deadlines |
| `public.study_routines` | Weekly timetable slots from Saturday to Friday |
| `public.exams` | Exam dates, timings, locations, marks, and countdowns |
| `public.study_sessions` | Focus sessions logged from the Pomodoro timer |

### Row Level Security (RLS)
All tables have RLS enabled with explicit policies (`auth.uid() = user_id`) so users can ONLY view, insert, update, or delete their own data.

---

## 🚀 Beginner Setup Guide for Supabase (Step-by-Step)

If you are developing or managing this from an Android phone or computer, follow these simple steps to get free cloud database and auth:

### Step 1: Create a Supabase Project (100% Free)
1. Go to [https://supabase.com](https://supabase.com) and click **Sign Up** (or Sign In with GitHub/Google).
2. Click **New project**.
3. Choose an Organization, enter Name: `StudyMate BD`, enter a strong **Database Password**, and select region `Southeast Asia (Singapore)`.
4. Click **Create new project** (it takes about 1-2 minutes to prepare).

### Step 2: Run the SQL Database Schema
1. In your Supabase dashboard, tap the **SQL Editor** tab on the left sidebar.
2. Click **New query**.
3. Copy the entire contents of the `supabase/schema.sql` file (or click the **"SQL কোড কপি করুন"** button directly in the StudyMate BD Settings screen).
4. Paste the SQL code into the editor and click **Run** (green button).
5. All 6 tables, triggers, and RLS policies are now created!

### Step 3: Get your API Credentials
1. In Supabase, go to **Project Settings** (gear icon) &rarr; **API**.
2. Find:
   - **Project URL**: e.g., `https://xyzabcdefg.supabase.co`
   - **anon / public key**: e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   *(⚠️ NEVER share or copy the secret `service_role` key!)*

### Step 4: Add Credentials to StudyMate BD
You have two easy ways:
- **Directly from Android Phone / Browser**:
  Open StudyMate BD &rarr; Go to **Settings** &rarr; Paste your Project URL and Anon Key into the Supabase Cloud section &rarr; Click **"সংরক্ষণ ও সংযোগ পরীক্ষা করুন"**.
- **Via Environment Variables (`.env`)**:
  ```env
  VITE_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
  VITE_SUPABASE_ANON_KEY="your-anon-publishable-key-here"
  VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-publishable-key-here"
  ```

---

## ☁️ Deploying to Cloudflare Pages (100% Free)

Cloudflare Pages provides blazing-fast global static frontend hosting with a free tier.

### Step 1: Push Code to GitHub
Ensure your repository contains all source files.

### Step 2: Connect Cloudflare Pages
1. Log in to your free [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Compute (Workers & Pages)** &rarr; **Pages** &rarr; **Connect to Git**.
3. Select your repository.

### Step 3: Build Configuration
Set the following build options:
- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`

### Step 4: Add Environment Variables in Cloudflare Pages
In the Pages project settings &rarr; **Environment Variables**:
- `VITE_SUPABASE_URL`: Your Supabase Project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key

Click **Save and Deploy**. Your web app will be live with a free `*.pages.dev` domain and free automatic SSL!

---

## 📋 Manual Testing Checklist

Before going to production, verify each flow:
- [x] **Local Demo Mode**: Can view and create tasks, routines, and exams without sign in.
- [x] **Language Switching**: Can toggle between Bengali (বাংলা) and English seamlessly.
- [x] **Theme Switch**: Light mode and dark mode both maintain high contrast.
- [x] **Task CRUD**: Creating, completing, reopening, editing, and deleting a task updates counters.
- [x] **Collision Detection**: Routine form alerts when start/end times overlap on the same weekday.
- [x] **Drift-Safe Timer**: Focus timer accurately counts down, can pause/resume, and plays chime on completion.
- [x] **Study Session Logging**: Completed Pomodoros increment the study streak and show in Analytics.
- [x] **Exam Countdowns**: Days remaining updates accurately and marks exams occurring today.
- [x] **Data Export/Import**: Downloaded JSON backup can be inspected and restored.
- [x] **Supabase Auth**: Sign up, login, and logout successfully query and clear state.

---

## 🛠️ Troubleshooting Guide

1. **"Failed to fetch" or Network error during login**:
   - Check that your Supabase URL starts with `https://`.
   - Verify that your Supabase project status is "Active" in the Supabase dashboard.
2. **"relation public.profiles does not exist"**:
   - You need to execute `supabase/schema.sql` in the Supabase SQL Editor.
3. **Timer seems stuck or doesn't decrement**:
   - StudyMate BD uses `Date.now()` timestamp differences. Ensure your device clock is synchronized.
4. **Data missing after sign out**:
   - Signing out safely clears user state and loads local demo data. Sign in again to retrieve your cloud data.
