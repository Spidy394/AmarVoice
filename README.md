# 🗣 AmarVoice – Online Grievance Platform

> A free online application which provides transparency, security and integrity the voices of the citizens of Bengal.

---

## 📌 Problem Statement

**Empowering users with AI-powered categorization, real-time tracking, and transparent resolution.**

---

## 🎯 Objective

AmarVoice has the objective of providing the people of Bengal a platform dedicated entirely to raise concerns about problems they face everyday and eventually find solutions. It solves the challenge of grievance addressing. Users can question about their problems directly to the concerned authority freely and securely. Users can upload text and voice complaints, get real-time progress updates, and engage with the community — all in one seamless interface.

Our goal is to make voices transparent, secure, interactive, and impactful with text-to-speech features, AI-suggestions and translation.

---

## 🧠 Team & Approach

### Team Name:
`BugLords`

### Team Members:  
- Shubhodeep Mondal ( [GitHub](https://github.com/Spidy394) | [LinkedIn](https://www.linkedin.com/in/shubho-deep) | `Full-Stack Developer` )  
- Aranya Rayed ( [GitHub](https://github.com/Abotishere) | [LinkedIn](https://www.linkedin.com/in/aranya-rayed-990671315/) | `Backend Developer` )  
- Rohan Kumar ( [GitHub](https://github.com/rohan911438) | [LinkedIn](https://www.linkedin.com/in/rohan-kumar-1a60b7314/) | `UX/UI Designer` )

### Our Approach:
- Tackled the need for transparent and secure questioning for individuals and families
- Focused on creating an simple and interactive interface
- Added AI to help users translate between English and Bengali and get suggestions
- Used flexible architecture to allow for multi-device access and future scalability

---

## 🛠️ Tech Stack

### Core Technologies:
- **Frontend:** Next.js, React.js, TailwindCSS, Shadcn
- **Backend:** Node.js
- **Database:** MongoDB
- **Deployment** Vercel
---

## ✨ Key Features

- ✅ Voice complaint submission: Transcribed by our AI with high accuracy
- ✅ AI-Powered categorization: Faster resolution and better resource allocation
- ✅ Real-time status: Track your complaint status in real-time
- ✅ Complete transparency with public ledger  
- ✅ End-to-end encryption ensures privacy and security
- ✅ Community engagement: Build strong civic participation
- ✅ Secure authentication protect your data.

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