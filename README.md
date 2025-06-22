# 🗣 AmarVoice – Online Grievance Platform

> A free online application which provides transparency, security and integrity the voices of the citizens of Bengal.

---

## 📌 Problem Statement

*Empowering users with AI-powered categorization, real-time tracking, and transparent resolution.*

---

## 🎯 Objective

AmarVoice has the objective of providing the people of Bengal a platform dedicated entirely to raise concerns about problems they face everyday and eventually find solutions. It solves the challenge of grievance addressing. Users can question about their problems directly to the concerned authority freely and securely. Users can upload text and voice complaints, get real-time progress updates, and engage with the community — all in one seamless interface.

Our goal is to make voices transparent, secure, interactive, and impactful with text-to-speech features, AI-suggestions and translation.

---

## 🧠 Team & Approach

### Team Name:
BugLords

### Team Members:  
- Shubhodeep Mondal ( [GitHub](https://github.com/Spidy394) | [LinkedIn](https://www.linkedin.com/in/shubho-deep) | Full-Stack Developer )  
- Aranya Rayed ( [GitHub](https://github.com/Abotishere) | [LinkedIn](https://www.linkedin.com/in/aranya-rayed-990671315/) | Backend Developer )  
- Rohan Kumar ( [GitHub](https://github.com/rohan911438) | [LinkedIn](https://www.linkedin.com/in/rohan-kumar-1a60b7314/) | UX/UI Designer )

### Our Approach:
- Tackled the need for transparent and secure questioning for individuals and families
- Focused on creating an simple and interactive interface
- Added AI to help users translate between English and Bengali and get suggestions
- Used flexible architecture to allow for multi-device access and future scalability

---

## 🛠 Tech Stack

### Core Technologies:
- **Frontend:** Next.js, React.js, TailwindCSS, Shadcn UI
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **AI Integration:** Google Gemini API for transcription and categorization
- **Authentication:** JWT-based secure authentication
- **Real-time Features:** Socket.io for live updates
- **Deployment:** Vercel (Frontend) & Node.js hosting (Backend)
---

## ✨ Key Features

- ✅ **Voice Complaint Submission:** Submit grievances in Bengali or English using voice recording with AI transcription achieving 95%+ accuracy
- ✅ **AI-Powered Categorization:** Smart categorization system automatically classifies complaints by department and priority for faster resolution
- ✅ **Real-time Status Tracking:** Track complaint status with live progress updates, estimated timelines, and instant notifications
- ✅ **Complete Transparency:** Public ledger system ensuring accountability and transparency in grievance resolution process
- ✅ **End-to-end Security:** Robust encryption ensures privacy and data protection for all user interactions
- ✅ **Community Engagement:** Interactive platform enabling civic participation, voting, and community-driven discussions
- ✅ **Multilingual Support:** Seamless Bengali-English translation and language detection for better accessibility
- ✅ **Secure Authentication:** New aged Civic authentication system protecting user data and ensuring authorized access

---

## 📽 Demo & Deliverables

- **Demo Video Link:** [Watch on YouTube](https://youtu.be/_D7zDgmdkGY)  
- **Live Application:** [AmarVoice Platform](https://amar-voice.vercel.app/)

---

## 🧪 How to Run the Project

### Requirements

- Node.js v18+  
- MongoDB database setup  
- Google Gemini API key (for AI features)
- Environment variables configuration

### Local Setup

```bash
# Clone the repository
git clone https://github.com/Spidy394/AmarVoice.git
cd AmarVoice

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

# Setup environment variables
cp .env.example .env
# Fill .env with necessary credentials:
# GEMINI_API_KEY=your_gemini_api_key
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret

# Start development servers
# Terminal 1 - Start backend server
cd server
npm run dev

# Terminal 2 - Start frontend server
cd client
npm run dev
```

Open in browser: [http://localhost:3000](http://localhost:3000)

---


## 🔍 Conceptual Data Model

- **Users:** id, email, password, profile, reputation, settings  
- **Complaints:** id, user_id, title, description, category, status, location, urgency, ai_analysis  
- **Comments:** id, complaint_id, user_id, content, timestamp  
- **Notifications:** id, user_id, message, type, read_status, created_at  
- **Votes:** id, user_id, complaint_id, vote_type, timestamp  
- **AI Analysis:** id, complaint_id, categorization, priority_score, suggested_actions

---

## 🧬 Future Scope

- 🔗 Integration with Government portals and departments for direct complaint routing  
- 📱 Native mobile applications (Android/iOS) with offline complaint drafting  
- 🌍 Multi-regional support with additional Indian languages  
- 📊 Advanced analytics dashboard for government officials and policy makers  
- 🤖 Enhanced AI features including sentiment analysis and auto-resolution suggestions  
- 🔔 SMS and WhatsApp notifications for users without internet access  
- 📈 Gamification elements to encourage civic participation and community involvement

---

## 🔒 Security Highlights

- **Password Security:** Mannaged by civic authentication system
- **Secure Communication:** HTTPS/TLS encryption for all client-server communication  
- **Authentication:** Civic authentication system with JWT for secure user sessions
- **Data Protection:** MongoDB encryption at rest and secure cloud storage  
- **Input Validation:** Comprehensive input sanitization and validation on both client and server  
- **Privacy Protection:** Optional anonymous complaint submission with data anonymization

---

## 📎 Resources / Credits

- **Frontend Technologies:** React.js, Next.js, TailwindCSS, Shadcn UI components  
- **Backend Technologies:** Node.js, Express.js, MongoDB, Mongoose ODM  
- **AI Integration:** Google Gemini API for natural language processing  
- **Real-time Features:** Socket.io for live updates and notifications  
- **Authentication:** JSON Web Tokens (JWT) for secure user sessions  
- **Open Source Libraries:** Various NPM packages and community-driven solutions

---

## 🏁 Final Words

This project represents our commitment to enhancing civic engagement and democratic participation in Bengal. We believe that every citizen's voice matters, and technology should bridge the gap between people and governance. AmarVoice empowers Bengali-speaking communities with modern, accessible tools to make their voices heard and create meaningful change in their communities.

---

<p align="center">
  Built with 💙 by BugLords © 2025
</p>
