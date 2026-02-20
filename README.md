<div align="center">
  <h1>🌱 RuralAssist AI (Kisan-Bhai)</h1>
  <p><strong>Your Digital Farmer Advisor</strong></p>
  <p>An intelligent, multilingual web application designed to empower Indian farmers with AI-driven insights, offline support, voice capabilities, and proactive crop management tools.</p>
</div>

## ✨ Features

- **🗣️ Multilingual AI Assistant:** "Kisan-Bhai" speaks English, Hindi, Punjabi, and Marathi. Featuring both text and Voice (TTS/Live Audio) interactions, complete with offline fallback support for common agricultural questions.
- **📸 Crop Growth & Disease Tracking:** Upload photos of your crops. The Gemini Vision API detects the growth stage, analyzes crop health, identities diseases, and recommends treatment steps.
- **⛈️ Weather & Irrigation Advisor:** Real-time localized weather updates, soil moisture estimates, and smart irrigation schedules to save water and prevent root rot.
- **💰 Market Intelligence:** Stay updated with current Mandi prices and FPO rates to ensure maximum profitability.
- **📜 Government Schemes Navigator:** Discover eligibility for crucial farming schemes like PM-Kisan and PM Fasal Bima Yojana.
- **🧪 Fertilizer Recommendations:** Get precise data on which fertilizers to use (e.g., Urea, DAP) based on your soil type and current crop stage.

## 🛠️ Tech Stack

- **Frontend Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Glassmorphism, custom animations)
- **Icons & Charts:** Lucide React, Recharts
- **AI Integration:** Google Gemini API (`@google/genai`) for text generation, vision analysis, and text-to-speech.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- A Google Gemini API Key

### Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   cd ruralassist-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Setup:
   Create a `.env` file in the root of the project and add your Gemini API Key:
   ```env
   VITE_API_KEY=your_gemini_api_key_here
   API_KEY=your_gemini_api_key_here
   ```

4. Run the Development Server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173/` (or the URL provided in your terminal).

## 📱 Usage

1. **Profile Setup:** Start by configuring your Farm Profile (Location, Soil Type, Farm Size, preferred Language).
2. **Chatting:** Click on the "AI Assistant" tab to ask questions. You can type, use voice chat, or upload images of your crops. Try clicking "Listen" beneath responses for native text-to-speech.
3. **Offline Mode:** If you lose internet access or exhaust API limits, Kisan-Bhai still responds natively to basic questions (Greetings, Weather, Schemes, Prices, Cropping Seasons).
4. **Growth Tracker:** Upload daily or weekly images of your crops in the "Growth Tracker" tab to maintain a digital ledger of crop health and AI analysis over time.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---
<div align="center">
  <p>Made with ❤️ by Sushant Chand</p>
</div>
