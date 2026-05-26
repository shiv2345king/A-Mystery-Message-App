# 🚀 True Feedback — Anonymous Mystery Messaging Platform

A full-stack anonymous messaging platform where users can receive honest and anonymous feedback securely. Built with modern technologies including Next.js, MongoDB, NextAuth, Brevo Email API, TailwindCSS, and TypeScript.

---

## 🌐 Live Demo

[True Feedback Live Demo](https://a-mystery-message-app.onrender.com?utm_source=chatgpt.com)

---

# ✨ Features

* 🔐 Secure Authentication with NextAuth
* 📧 OTP Email Verification using Brevo API
* 🕵️ Anonymous Messaging System
* 👤 Username-based Public Profiles
* 🔒 Protected Routes & Sessions
* ⚡ Fully Responsive Modern UI
* 🌙 Clean TailwindCSS Design
* 🛡️ JWT-based Session Handling
* 📦 MongoDB Database Integration
* 🔥 Real-time Form Validation with Zod + React Hook Form

---

# 🛠️ Tech Stack

## Frontend

* Next.js
* TypeScript
* TailwindCSS
* ShadCN UI
* React Hook Form
* Zod

## Backend

* Next.js API Routes
* MongoDB
* Mongoose
* NextAuth
* bcryptjs

## Email Service

* Brevo Transactional Email API

## Deployment

* Render

---

# 📸 Screenshots

## Authentication

* Sign Up with OTP verification
* Secure Login System

## Dashboard

* Anonymous message receiving interface
* Public feedback sharing

---

# ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string

NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

BREVO_API_KEY=your_brevo_api_key
SENDER_EMAIL=your_verified_email
```

---

# 🚀 Getting Started

Clone the repository:

```bash
git clone https://github.com/your-username/your-repo-name.git
```

Navigate into project directory:

```bash
cd your-repo-name
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

# 📂 Folder Structure

```bash
src/
 ├── app/
 ├── components/
 ├── helpers/
 ├── lib/
 ├── model/
 ├── schemas/
 ├── types/
```

---

# 🔐 Authentication Flow

1. User signs up
2. OTP sent via email using Brevo API
3. User verifies account
4. NextAuth creates secure session
5. User receives anonymous messages

---

# 📧 Email Verification

This project uses Brevo Transactional Email API for OTP verification emails.

---

# 🌟 Future Improvements

* 🔔 Real-time notifications
* 🤖 AI-generated feedback suggestions
* 📱 Mobile app support
* 🖼️ Profile customization
* 🌐 Social sharing

---

# 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

# 📜 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

Shivam Gupta

* GitHub: [GitHub Profile](https://github.com/shiv2345king?utm_source=chatgpt.com)
* LinkedIn: [LinkedIn Profile](https://www.linkedin.com/in/shivam-gupta-77a31630b/?utm_source=chatgpt.com)

---

# ⭐ Support

If you liked this project, consider giving it a ⭐ on GitHub!
