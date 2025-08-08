# 🧠 Hire Ready Application

A smart, all-in-one platform to help users prepare for technical  & Conceptual interviewswith AI-driven tools, voice-based mock interviews, resume insights, and real-time live coding practice.

---

## 🚀 Features

### 1. ✨ AI Generated QNA
- Automatically generate interview questions and suggested answers tailored to a user's job role or domain (Frontend, Backend, Data Science, etc).
- Uses Gemini API to ensure realistic and relevant questions.
- Ideal for quick self-assessment and understanding expected answers.

### 2. 📄 Resume Analyzer
- Upload your resume 
- get AI-based feedback.
.

### 3. 🗣️ Mock Interview (Voice Agent)
- Engage in voice-based mock interviews.
- AI acts as the interviewer, asking and responding in real time.
- Mimics actual interview pressure and provides post-interview feedback.

### 4. 💻 Live Coding
- Solve coding problems with a real-time coding editor.
- compiles code, and gives feedback on efficiency and correctness.
- Leaderboard to see the top ranking

---

## 🛠️ Tech Stack

| Layer         | Technology                                  |
|---------------|---------------------------------------------|
| Frontend      | React.js, Tailwind CSS, GSAP, Framer Motion, etc                      |
| Backend       | Node.js / Express, MongoDB (Database), etc                |
| AI Services   | Gemini |
| Live Coding   | Monaco Editor, etc
| Resume Parsing| PDF.js, Mammoth, PDF Parse
| Many others tools

---

## 📦 Installation

### 1. Clone the repository
```bash
git clone the github repository
cd to your folder
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables


### 4. Run the app
```bash
npm run dev
```

# 📡 API Documentation

This document provides an overview of the available API endpoints used in the application, divided into key feature areas.

> 🔐 All routes prefixed with `/api/...`. Some require authentication via JWT Bearer Token.

---

## 🔑 Auth Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login` | Login user |
| GET    | `/api/auth/profile` | Get authenticated user profile |
| POST   | `/api/auth/forgot-password` | Request password reset link |
| POST   | `/api/auth/reset-password` | Reset user password |
| POST   | `/api/auth/upload-image` | Upload user profile image |
| GET    | `/api/auth/login/google` | Initiate Google OAuth login |
| GET    | `/api/auth/login/google/callback` | Handle Google login callback |

---

## 🤖 AI Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/ai/generate-questions` | Generate interview questions based on input |
| POST   | `/api/ai/generate-explanations` | Generate explanation for a concept |
| POST   | `/api/ai/generate-quiz` | Generate quiz questions |

---

## 🧾 Resume Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/resumes/upload` | Upload a resume file for analysis |

---

## 💬 Question Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/questions/add` | Add AI-generated questions to a session |
| POST   | `/api/questions/:id/pin` | Toggle pin on a question |
| POST   | `/api/questions/:id/note` | Add/update note on a question |

---

## 📋 Session Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/sessions/create` | Create a new interview session |
| GET    | `/api/sessions/my-sessions` | Retrieve all user's sessions |
| GET    | `/api/sessions/:id` | Get a specific session by ID |
| DELETE | `/api/sessions/:id` | Delete a session |

---

## 👨‍💻 Live Code Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/code/generate` | Generate a coding question |
| GET    | `/api/code/difficulty/:difficulty` | Get coding questions by difficulty |
| GET    | `/api/code/:questionId` | Get a specific coding question |
| POST   | `/api/code/submit/:questionId` | Submit a solution for feedback |

---

## 🏆 Leaderboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/leaderboard` | Get leaderboard of top users |

---

## 🖼️ Uploads

| Path | Description |
|------|-------------|
| `/uploads/<filename>` | Serve uploaded files (images, resumes, etc.) |

---

## 🌐 Base URL (Frontend)

```js
export const BASE_URL = "http://localhost:8000";
```

---

## 🗂️ Notes

- All `POST`/`GET` routes with protected content require an `Authorization: Bearer <token>` header.
- Google Auth callback handles client redirect and token transfer securely using postMessage.

---

## 📁 Related Frontend Pages

These API endpoints are consumed in the following routes (based on `App.jsx`):

- `/features/qna` – Q&A Generator
- `/features/resume` – Resume Analyzer
- `/features/mock-interview` – Voice-based Mock Interview
- `/features/live-code` – Live Coding Practice & Submissions
- `/features/leaderboard` – Leaderboard Page

---

## 🛠️ To Run Locally

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📬 Contact
For more details, reach out to the developer team.


## 🙌 Contributing

Contributions are welcome!  
Feel free to fork this project and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer

**Andi Daffa Liefalza**  
Fullstack Engineer  
- [LinkedIn](https://www.linkedin.com/in/andidaffaliefalza)
- [Portfolio](https://daffaliefalza.netlify.app/)
- [Email](mailto:liefalzaa@gmail.com)

**Bintang Duinata**  
Fullstack Engineer  
- [LinkedIn](https://www.linkedin.com/in/bintangduinata08)
- [Portfolio](https://portfoliobintangg.netlify.app/)
- [Email](mailto:bintang.duinata31@gmail.com)

**Aldiansyah Anugrah Ramadhan**  
Frontend Developer
- [LinkedIn](https://www.linkedin.com/in/Aldiansyah-ar)
- [Portfolio](https://github.com/Aldiansyah-ar)
- [Email](mailto:aldiansyahaldi621@gmail.com)

**Hera Safitri**  
UIUX & Frontend  
- [LinkedIn](https://www.linkedin.com/in/hera-safitri-93a962266/)
- [Email](mailto:herasafitri68@gmail.com)

---
