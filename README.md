# Rok Ranking

A web system for managing Rise of Kingdoms rankings using **Next.js + Prisma + SQLite**. Simple to install, lightweight, and suitable for personal use, alliances, or small communities.

---

## 📌 Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [Requirements](#requirements)
* [Installation](#installation)
* [Environment Configuration](#environment-configuration)
* [Database / Prisma](#database--prisma)
* [Available Scripts](#available-scripts)
* [Running the Project](#running-the-project)
* [Upload Security (UPLOAD_SECRET)](#upload-security-upload_secret)
* [Deployment & Production Notes](#deployment--production-notes)
* [Contributing](#contributing)

---

## 📖 Overview

**Rok Ranking** is a web-based ranking system designed for Rise of Kingdoms. It provides a clean interface for storing and displaying ranking data.

Built with:

* **Next.js** for the frontend and API routes
* **Prisma ORM** for database interaction
* **SQLite** for simple local and server storage

---

## ✨ Features

✔ Ranking management
✔ Protected data uploads
✔ Fast setup using SQLite
✔ Next.js application structure
✔ Works locally or on servers easily

---

## 🔧 Tech Stack

* **Next.js 15**
* **TypeScript**
* **Prisma ORM**
* **SQLite**
* **Node.js**

---

## 📦 Requirements

Before installing, make sure you have:

* **Node.js** (v18 or newer recommended)
* **npm** or **yarn**
* **Git**

---

## 📥 Installation

Clone the repository:

```bash
git clone https://github.com/werioliveira/rok-ranking.git
cd rok-ranking
```

Install dependencies:

```bash
npm install
# or
yarn install
```

---

## ⚙ Environment Configuration

The project requires only **one environment variable**.

Create a `.env` file based on `.env.example` and add:

```env
UPLOAD_SECRET=your_upload_password
```

This secret protects the upload routes.

---

## 🗄 Database / Prisma

The system uses **SQLite**, which requires no external setup.

`schema.prisma` uses:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### Apply migrations and create the database

```bash
npx prisma migrate dev --name init
```

### Generate the Prisma Client

```bash
npx prisma generate
```

### (Optional) Open Prisma Studio

```bash
npx prisma studio
```

This provides a visual interface for viewing and editing the database.

---

## 📜 Available Scripts

You can list all scripts with:

```bash
npm run
```

Common ones include:

* `dev` – start the Next.js development server
* `build` – create the production build
* `start` – run the production server
* Prisma tools (`migrate`, `generate`, etc.)

---

## ▶ Running the Project

After setting up `.env` and database migrations:

### Development mode

```bash
npm run dev
```

Access the app at:
👉 [http://localhost:3000](http://localhost:3000)

### Production mode

```bash
npm run build
npm start
```

---

## 🔐 Upload Security (UPLOAD_SECRET)

Some API routes accept **data uploads**, which are protected using `UPLOAD_SECRET`.

* You must include the correct secret to upload data
* Prevents unauthorized submissions
* Never expose this value publicly
* Use a strong password in production

---

## 🚀 Deployment & Production Notes

### SQLite usage notes

SQLite works well when:

* The server is single-instance
* Load is moderate
* Fast local storage is preferred

If the project needs scaling, you can migrate to PostgreSQL or MySQL using Prisma.

### Recommended hosting options

* **VPS (Docker or PM2)** – best option
* **Railway / Render / Fly.io** – easy setup
* **Vercel** – possible, but SQLite does *not* persist across builds

---

## 🤝 Contributing

1. Fork the repository
2. Create a new branch:

   ```bash
   git checkout -b my-feature
   ```
3. Make your changes
4. Test everything
5. Submit a pull request
