

---

```markdown
# 🌍 KeAttractions

KeAttractions is a full-stack tourism web application built with **React.js** and **Next.js**, connected to a **MySQL** database. It allows users to explore and book attraction sites across Kenya, while admins verify and manage bookings.

---

## 📌 Features

### 🧑‍💼 User Side
- 📝 Register / Login
- 📍 View attraction sites
- ✅ Book sites
- ✏️ Edit and manage their bookings
- 📦 View booking status

### 🛡️ Admin Side
- 🔐 Secure admin login
- 🧾 View user bookings
- ✔️ Accept / reject / verify bookings
- 🛠️ Manage attraction listings

---

## 🧱 Tech Stack

- **Frontend:** React.js + Next.js
- **Backend:** Node.js / Express.js (API routes via Next.js)
- **Database:** MySQL
- **Auth:** JWT / Session-based (based on your config)
- **Styling:** Tailwind CSS / CSS Modules (if applicable)

---

## 🗄️ Database

MySQL database includes:
- `users` table
- `bookings` table
- `attractions` table
- `admins` table

Ensure MySQL is running and your `.env` variables are set.

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/keattractions.git
cd keattractions
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env.local` file in the root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=keattractions
JWT_SECRET=your_jwt_secret
```

### 4. Run the development server

```bash
npm run dev
```

The app should now be running at `http://localhost:3000`.

---

## 🚀 Build for Production

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
keattractions/
├── pages/             # Next.js routes (admin, user, API)
├── components/        # Reusable UI components
├── lib/               # DB connection, auth logic
├── public/            # Images, static files
├── styles/            # CSS / Tailwind files
├── .env.local         # Environment config
└── README.md
```

---

## ✨ Contributions

Feel free to fork and contribute via pull requests!

---

## 🛡️ License

This project is under the [MIT License](LICENSE).

---

---
