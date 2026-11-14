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
```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
