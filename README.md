# 🚀 LedgerLens – Blockchain-Assisted Secure Remote Sensing Image Retrieval

A full-stack MERN application that demonstrates **secure image retrieval using Blockchain, Homomorphic Encryption simulation, and Federated Learning**. The project ensures image integrity through blockchain verification while enabling privacy-preserving image retrieval.

## 🌐 Live Demo

**Frontend:** https://image-retrieval-mu.vercel.app

**Backend API:** https://image-retrieval-u936.onrender.com

---

## 📸 Screenshots

> Add screenshots here

- Home Page
- Image Indexing
- Image Retrieval
- Blockchain Ledger
- Federated Learning Dashboard

---

## ✨ Features

- 🔐 Secure image indexing
- 🖼️ Image retrieval using encrypted feature vectors
- ⛓️ Blockchain-based tamper detection
- 🔍 Image integrity verification
- 🤖 Federated Learning simulation
- 🔑 Key Management Center
- 📊 Blockchain Ledger visualization
- ☁️ MongoDB Atlas database
- 🚀 Fully deployed on Vercel & Render

---

## 🛠 Tech Stack

### Frontend

- React.js
- Vite
- Axios
- CSS

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Multer
- Sharp

### Deployment

- Vercel
- Render

---

## Project Architecture

```
client
   │
   ▼
React + Vite
   │
Axios API
   │
   ▼
Express Server
   │
──────────────────────────────
│ Feature Extraction
│ Homomorphic Encryption
│ Blockchain
│ Federated Learning
──────────────────────────────
   │
MongoDB Atlas
```

---

## Project Workflow

### 1. Image Indexing

- Upload image
- Feature extraction
- Homomorphic encryption
- Store encrypted vector
- Add blockchain record

### 2. Image Retrieval

- Upload query image
- Feature extraction
- Compare encrypted vectors
- Return ranked images

### 3. Blockchain Verification

- Verify stored hash
- Detect tampering
- Validate blockchain integrity

### 4. Federated Learning

- Simulated local training
- FedAvg aggregation
- Global model update

---

## Folder Structure

```
image-retrieval
│
├── client
│   ├── src
│   ├── components
│   ├── pages
│   └── api.js
│
├── server
│   ├── routes
│   ├── models
│   ├── utils
│   ├── config
│   └── server.js
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/khushahal0707/image-retrieval.git
```

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## Environment Variables

### Backend (.env)

```env
PORT=5001
MONGO_URI=YOUR_MONGODB_URI
CLIENT_ORIGIN=http://localhost:5173
```

---

## Future Improvements

- Real Homomorphic Encryption (Microsoft SEAL)
- Cloudinary image storage
- JWT Authentication
- Docker Support
- Kubernetes Deployment
- CI/CD Pipeline

---

## Author

**Khushahal Sahu**

GitHub: https://github.com/khushahal0707

LinkedIn: https://www.linkedin.com/in/khushahal-sahu-87125a324/

---

## License

This project is developed for educational and research purposes.
