<div align="center">
  <img src="./public/logo.png" alt="PrepBoard Logo" width="120" height="120" />
  <h1>PrepBoard</h1>
  <p><strong>AI-powered Exam Preparation Tracker Web App</strong></p>
  <p>Track your study sessions, visualize progress, and optimize your learning with AI.</p>
</div>

<br />

## 📖 Project Overview

**PrepBoard** is a modern, responsive web application designed to help students track and optimize their exam preparation. It provides an intuitive dashboard to manage multiple subjects, topics, and study logs. With powerful AI tools built-in, you can instantly convert raw syllabus text or PDFs into an organized tracker and automatically generate personalized daily study roadmaps using n8n webhooks.

## ✨ Key Features

- **AI Study Planner:** Automatically generate dynamic, personalized daily study roadmaps based on your exam date and remaining incomplete topics.
- **Multi-Subject Tracking:** Seamlessly manage different subjects and keep your study progress organized.
- **Topic-wise Checklist System:** Break down large subjects into manageable units and topics.
- **AI Syllabus Import:** Upload a PDF or paste text, and let AI automatically generate a structured study tracker.
- **Google Authentication:** Secure and easy login powered by Firebase.
- **User-Specific Data Storage:** Your data is safely stored and synced in real-time using Firestore.
- **Daily Study Log:** Record study hours, topics covered, and PYQs (Previous Year Questions) completed.
- **Progress Tracking:** Visualize your mastery over topics and units.
- **Dashboard Analytics:** Gain actionable insights into your study habits.
- **Calendar Heatmap:** GitHub-style consistency tracking to maintain your daily streak.
- **Light & Dark Mode:** A beautifully designed UI with seamless theme support.
- **Responsive Design:** Optimized for desktops, tablets, and mobile devices.

## 🛠 Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + Framer Motion
- **Backend:** Firebase (Authentication + Firestore)
- **AI Integration:** 
  - Groq / OpenAI API (for lightning-fast syllabus parsing)
  - n8n Webhooks (for intelligent daily roadmap generation)
- **State Management:** React Context API
- **Icons & UI:** Lucide React

## 📸 Screenshots

<details>
<summary><b>View Screenshots</b></summary>
<br />

### Dashboard Overview
*(Add your Dashboard screenshot here - `![Dashboard](./docs/dashboard.png)`)*

### AI Syllabus Importer
*(Add your AI Importer screenshot here - `![AI Import](./docs/ai-import.png)`)*

### AI Study Planner (New)
*(Add your AI Planner screenshot here - `![AI Planner](./docs/ai-planner.png)`)*

### GitHub-style Consistency Heatmap
*(Add your Heatmap screenshot here - `![Heatmap](./docs/heatmap.png)`)*

</details>

## 📁 Folder Structure

```text
src/
├── assets/           # Static assets like images and global CSS
├── components/       # Reusable UI components (Dashboard, Logger, Importer, etc.)
├── contexts/         # React Contexts (AuthContext, ThemeContext)
├── data/             # Static data models and default states
├── hooks/            # Custom React hooks (e.g., useLocalStorage)
├── lib/              # Utility functions and Firebase configuration
├── App.jsx           # Main application layout and routing
└── main.jsx          # Application entry point
```

## 🚀 Installation & Setup

Follow these steps to run the project locally on your machine.

**1. Clone the repository**
```bash
git clone https://github.com/vedansh07-14/PrepBoard.git
cd PrepBoard
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure Environment Variables**
Create a `.env` file in the root directory and add your Firebase and API configurations:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

VITE_GROQ_API_KEY=your_groq_api_key
VITE_N8N_WEBHOOK_URL=your_n8n_study_planner_webhook_url
```

**4. Run the development server**
```bash
npm run dev
```

## 💡 Usage

1. **Sign In:** Use your Google account to log into PrepBoard.
2. **Setup Subjects:** Add a subject manually or use the **AI Import** feature to generate units and topics directly from your syllabus PDF/text.
3. **Track Progress:** Mark topics as complete as you study them.
4. **Generate Study Plan:** Navigate to the AI Planner tab, enter your target exam date, and instantly receive a personalized day-by-day roadmap grouping concepts, practice, and revision!
5. **Log Daily Effort:** Use the Daily Logger to record hours spent and PYQs solved.
6. **Analyze:** Check your dashboard and heatmap to visualize your consistency and overall progress.

## 🔮 Future Improvements

- 🔥 **Streak Tracking:** Gamified streaks to boost daily motivation.
- 🧠 **Smart Recommendations:** AI-driven suggestions on what to study next based on your weak areas.
- 📱 **Native Mobile App:** A React Native version for on-the-go tracking.
- 📊 **Advanced Analytics:** More detailed graphs and predictive scoring.

## 🤝 Contributing

Contributions are always welcome! 

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [MIT License](LICENSE).
