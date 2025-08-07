# 🎙️ VeriSay – Voice-Driven Agreement Platform Powered by AI & Blockchain

**VeriSay** is a next-generation platform that transforms verbal agreements into legally valid contracts using voice recording, AI transcription, facial identity verification, and blockchain validation – all from your mobile device.

> 🛡️ **Verbal to Valid. Fast. Secure. Decentralized.**

---

## 🚀 Features

- 🎤 **Voice Agreement Recording**  
  Record agreements in natural language – no forms, no friction.

- 🧠 **AI-Powered Transcription & Summarization**  
  OpenAI Whisper transcribes voice to text; GPT summarizes key terms.

- 👤 **Face Identity Verification (Dual-Party)**  
  Both parties must capture real-time facial identity for authenticity.

- 📃 **Dynamic Legal Template Generator**  
  Auto-generates contracts for Rental, Loan, Exchange, Business, and Custom deals.

- 🔗 **Blockchain Validation (Planned)**  
  Immutable record storage for agreement integrity and dispute protection.

- 🗂️ **Local & Cloud File Storage Options**  
  Store audio and image files locally or upgrade to GCP/Firebase integration.

- 🔒 **Secure Auth (Phone + Google Sign-in)**  
  Firebase Authentication ensures safe user access.

---

## 🏗️ Tech Stack

| Frontend      | Backend         | AI & Services     | Database         |
|---------------|-----------------|-------------------|------------------|
| React Native  | Java Spring Boot| OpenAI Whisper/GPT| MySQL (Aiven)    |
| Firebase Auth | RESTful APIs    | Google Cloud APIs | GCP / Local Dev  |
| Expo          | JWT Secured     |                   |                  |

---

## 📱 Screenshots

| Agreement Creation | Face Capture | Transcription |
|--------------------|--------------|---------------|
| ![Agreement](screens/agree.png) | ![Face](screens/face.png) | ![Transcription](screens/transcript.png) |

> (📸 Screenshots are placeholders. Replace with your actual images.)

---

## 🔧 How It Works

1. **Start a new agreement** by selecting a type (Rental, Loan, etc.)
2. **Record your voice** explaining the deal terms
3. **Capture face verification** for both parties
4. **AI transcribes and extracts** key agreement info
5. **Auto-generated contract PDF** is created and saved
6. (Coming Soon) **Blockchain validation** stores final agreement

---

## 🛠️ Local Setup (Dev)

```bash
# Clone repo
git clone https://github.com/your-username/verisay.git
cd verisay

# Setup backend
cd backend
./mvnw spring-boot:run

# Setup frontend
cd ../frontend
npm install
npm start
