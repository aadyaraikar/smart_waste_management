# smart_waste_management
# ♻️ Smart Waste Management & Local Recycler Routing

An AI-powered mobile waste classification and local recycler routing application built with **React Native (Expo Router)**, **Express.js**, and **FastAPI**. Designed to bridge the gap between household waste sorting and authorized local recycling hubs in **Madgaon, Goa**.

---

## ✨ Key Features

- **📸 Instant AI Waste Classification:** Snap a photo or upload from your gallery to classify items across **7 distinct categories**: *Metal, Battery, Glass, Organic, Paper/Cardboard, Plastic,* and *Shoes/Textiles*.
- **📍 Live Local Bin & Recycler Routing:** Interactive map integration (`react-native-maps`) centered around Madgaon, Goa, displaying real-time distances to verified local hubs (*Verna Industrial E-Waste Hub*, *Madgaon Authorised Tech Recycler*, *Fatorda Municipal Dry Waste Center*, and *Navelim Green Scrap & Kabadiwala Hub*).
- **🚚 Seamless Pickup Scheduling:** One-tap pickup requests with location tagging (*Home, Office, Other*) that connect consumer waste directly to local collection routes.
- **🏆 Gamified Impact Dashboard:** Real-time points tracking (`+250 pts` per scan), daily scan targets (`1/4` to `4/4` progress ring), ongoing streak tracking, and a live feed of recent API classifications.

---

## 🏗️ System Architecture

The application follows a decoupled three-tier architecture:

1. **Mobile Client (`React Native / Expo Router`):** Cross-platform mobile interface featuring file-based routing (`Scan`, `Result`, `Find & Pickup`, and `Impact` tabs) and cross-platform `FormData` image handling.
2. **API Gateway & Persistence (`Node.js / Express` on Port `5000`):** Handles image multipart uploads, manages user points/streak persistence, logs scheduled pickups, and coordinates inference requests.
3. **ML Inference Engine (`Python / FastAPI` on Port `8000`):** Processes uploaded waste images and returns predicted waste categories, confidence scores, and disposal instructions.

---

## 🛠️ Tech Stack

- **Frontend:** React Native, Expo Router, TypeScript/JavaScript, `@expo/vector-icons`, `expo-image-picker`, `react-native-maps`, Axios
- **Backend:** Node.js, Express.js, Multer / FormData
- **Machine Learning:** Python, FastAPI, Computer Vision Classification Model

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Expo Go app installed on your physical Android/iOS device (connected to the same local network/hotspot)

### 1. Start the FastAPI ML Service (Port `8000`)

cd ml-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload


2. Start the Express Backend (Port 5000)
Bash


cd backend
npm install
node server.js
3. Configure & Run the Expo Mobile App
Update API_BASE_URL in constants/api.js with your host machine's local IP address (e.g., http://10.231.201.218:5000), then launch Expo:

Bash


cd frontend
npm install
npx expo start -c
Scan the QR code in your terminal using Expo Go on your phone.

📱 User Flow
Scan: Capture or upload an image of a waste item (e.g., batteries, plastic bottles, or tin cans) and tap Classify Waste Item.

Result: View the detected waste category, confidence score, recommended recycler, and proper disposal action.

Find & Pickup: Choose your pickup location (Home, Office, or Other), view nearby Madgaon recycling hubs on the map, and tap Confirm Pickup Request.

Impact: Watch your daily scan progress ring, streak counter, and total eco-points update dynamically.
