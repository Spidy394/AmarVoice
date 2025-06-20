# 💸 ArthaFlow – Smart Budgeting Dashboard

> An intuitive personal finance dashboard with gamification, visual insights, and AI-based suggestions to reduce expenses and grow savings.

---

## 📌 Problem Statement

**Empowering users with real-time financial clarity, actionable insights, and motivation to budget smarter.**

---

## 🎯 Objective

ArthaFlow solves the challenge of personal and small-scale financial management by providing users with a smart budgeting platform that goes beyond spreadsheets. Users can upload bank statements, set budgeting goals, receive behavioral insights, and engage with gamified challenges — all in one seamless interface.

Our goal is to make budgeting engaging, personalized, and insightful, using cloud syncing, beautiful charts, and AI-driven suggestions.

---

## 🧠 Team & Approach

### Team Name:  
`BugLords`

### Team Members:  
- Shubhodeep Mondal ( [GitHub](https://github.com/Spidy394) | [LinkedIn](https://www.linkedin.com/in/shubho-deep) | `Frontend Developer` )  
- Aranya Rayed ( [GitHub](https://github.com/Abotishere) | [LinkedIn](https://www.linkedin.com/in/aranya-rayed-990671315/) | `Backend Developer` )  
- Rohan Kumar ( [GitHub](https://github.com/rohan911438) | [LinkedIn](https://www.linkedin.com/in/rohan-kumar-1a60b7314/) | `UX/UI Designer` )

### Our Approach:
- Tackled the need for smart, goal-oriented budgeting for individuals, families, freelancers, and small businesses
- Focused on creating a gamified and motivating interface
- Added AI to help users cut costs and optimize savings
- Used flexible architecture to allow for multi-device access and future scalability

---

## 🛠️ Tech Stack

### Core Technologies:
- **Frontend:** React.js, TailwindCSS, Shadcn, Chart.js
- **Backend:** Superbase
- **Database:** PostgreSQL
- **Deployment** Vercel
---

## ✨ Key Features

- ✅ CSV/bank statement uploads with smart parsing  
- ✅ Visualizations: Spending trends, category breakdowns, net-worth timelines  
- ✅ Gamified experience: Points, badges, budgeting challenges  
- ✅ Cloud syncing for access across devices  
- ✅ AI-based suggestions to reduce spending and boost savings  
- ✅ Real-time notifications and Google Calendar reminders  

---

## 📽️ Demo & Deliverables

- **Demo Video Link:** https://youtu.be/_D7zDgmdkGY  
- **Live Link:** https://artha-flow.vercel.app/  

---

## 🧪 How to Run the Project

### Requirements:
- Node.js v14+  
- PostgreSQL setup  
- API keys (for calendar/notification features)
- OpenAI API key (for AI suggestions)

### Local Setup:
```bash
git clone https://github.com/Spidy394/ArthaFlow.git
cd ArthaFlow
npm install

# Setup env variables
cp .env.example .env
# Fill .env with necessary credentials

# Start development
npm run dev
```

Open in browser: [http://localhost:8000](http://localhost:8000)

---


## 🔍 Conceptual Data Model

- `Users`: id, email, password, settings  
- `Transactions`: id, user_id, category, amount, date, type  
- `Budgets`: id, user_id, category, target, current, start_date, end_date  
- `Challenges`: id, user_id, name, status, points  
- `Notifications`: id, user_id, message, type, date  

---

## 🧬 Future Scope

- 🔗 Bank API integration for auto-import  
- 📱 Native mobile apps (Android/iOS)  
- 💱 Multi-currency support  
- 📊 Predictive analytics and investment suggestions  

---

## 🔒 Security Highlights

- Passwords encrypted with bcrypt  
- HTTPS for all client-server communication  
- JWT-based session handling  
- Secure cloud storage and encryption at rest  

---

## 📎 Resources / Credits

- React, Chart.js, TailwindCSS  
- PostgreSQL, Node.js  
- Open-source CSV parsers and budgeting tools as references

---

## 🏁 Final Words

This project is our step toward simplifying financial wellness. We believe budgeting should be empowering — not boring — and ArthaFlow brings life to your finances with visuals, gamification, and smart suggestions.

---

<p align="center">
  Built with 💙 by BugLords ©️ 2025
</p>