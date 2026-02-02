# 🚀 FiTracker (By Azero)

[![Bikin APK Android](https://github.com/azerodesign/fitracker/actions/workflows/bikin-apk.yml/badge.svg)](https://github.com/azerodesign/fitracker/actions/workflows/bikin-apk.yml)

**FiTracker** is a premium, Bauhaus-inspired financial tracking application designed for simplicity, speed, and automation. Built by **Azero**, it empowers users to take control of their finances with a state-of-the-art interface and smart integrations.

---

## ✨ Features

- **🎨 Bauhaus Design**: A stunning, premium UI with a bold color palette (#38bdf8, #0f172a) and responsive layout.
- **🔄 GoPay Auto-Sync**: Automatically track your GoPay transactions by parsing Gmail receipts using "Bring Your Own Key" (BYOK) security.
- **📁 Multi-Wallet Management**: Keep track of Banks, E-Wallets, and Cash in one place.
- **📊 Smart Budgets**: Set monthly spending limits and track your progress in real-time.
- **📱 Android App**: Builds automatically via GitHub Actions - download APK from releases.
- **🔒 Privacy First**: Your data stays on your Supabase instance. No hidden trackers or third-party data sharing.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js + Vite |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Backend/Auth** | Supabase (PostgreSQL & Edge Functions) |
| **API** | Google Gmail API (OAuth2) |
| **Mobile** | Capacitor (Android) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Supabase Project
- Google Cloud Project (for GoPay Sync)

### Installation
```bash
git clone https://github.com/azerodesign/fitracker.git
cd fitracker/fitracker-app
npm install
```

### Environment Setup
Create a `.env` file in the root of `fitracker-app`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running Locally
```bash
npm run dev
```

---

## 📱 Android APK

The Android APK is automatically built using GitHub Actions when you push to `main`.

### Download APK
1. Go to [Actions tab](https://github.com/azerodesign/fitracker/actions)
2. Click on the latest successful "Bikin APK Android" workflow
3. Download the `fitracker-debug-apk` artifact
4. Extract the `.zip` and install the `.apk` on your Android device

### Build Locally (Optional)
```bash
npm run build
npx cap add android
cd android
./gradlew assembleDebug
```

---

## 📜 Documentation

Detailed setup for GoPay Auto-Sync and Deployment can be found in the Docs Page inside the application.

---

## ❤️ Credits
Created and Maintained by **Azero**.

*Smarter Financial Tracking for Your Freedom.*

