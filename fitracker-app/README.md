# 🚀 FiTracker (By Azero)

**FiTracker** is a premium, Bauhaus-inspired financial tracking application designed for simplicity, speed, and automation. Built by **Azero**, it empowers users to take control of their finances with a state-of-the-art interface and smart integrations.

---

## ✨ Features

- **🎨 Bauhaus Design**: A stunning, premium UI with a bold color palette (#38bdf8, #0f172a) and responsive layout.
- **🔄 GoPay Auto-Sync**: Automatically track your GoPay transactions by parsing Gmail receipts using "Bring Your Own Key" (BYOK) security.
- **📁 Multi-Wallet Management**: Keep track of Banks, E-Wallets, and Cash in one place.
- **📊 Smart Budgets**: Set monthly spending limits and track your progress in real-time.
- **📄 Documentation**: Built-in user guides and technical setup pages.
- **🔒 Privacy First**: Your data stays on your Supabase instance. No hidden trackers or third-party data sharing.

---

## 🛠️ Tech Stack

- **Frontend**: React.js + Vite
- **Styling**: Tailwind CSS / Vanilla CSS (Modern Bauhaus System)
- **Icons**: Lucide React
- **Backend/Auth**: Supabase (PostgreSQL & Edge Functions)
- **API**: Google Gmail API (OAuth2)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Supabase Project
- Google Cloud Project (for GoPay Sync)

### 2. Installation
```bash
git clone https://github.com/azero/fitracker.git
cd fitracker/fitracker-app
npm install
```

### 3. Environment Setup
Create a `.env` file in the root of `fitracker-app`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Running Locally
```bash
npm run dev
```

---

## 📜 Documentation

Detailed setup for GoPay Auto-Sync and Deployment can be found in the [Docs Page](file:///c:/Fitracker/fitracker-app/src/pages/Dashboard.jsx) inside the application or in the `brain/` directory.

---

## ❤️ Credits
Created and Maintained by **Azero**.

*Smarter Financial Tracking for Your Freedom.*
