# 🏠 NestMate | Co-Living & Roommate Management System

NestMate is a modern co-living platform designed to simplify room searching, tenant management, and roommate matching. Whether you're a student, a professional, or a property owner, NestMate makes shared living organized and stress-free.

---

## 🚀 Live Demo & Links

- **Frontend:** [nestmatesharing.netlify.app](https://nestmatesharing.netlify.app)
- **API (Backend):** [co-living-space-platform-shared-living.onrender.com](https://co-living-space-platform-shared-living.onrender.com/api/health)
- **GitHub Repository:** [Co-Living-Space-Platform-Shared-Living-Roommate-Management-System](https://github.com/Tushar-2808/Co-Living-Space-Platform-Shared-Living-Roommate-Management-System)

---

## ✨ Key Features

### 👤 User Authentication & Roles
- **Multitenant Support:** Separate dashboards for **Tenants**, **Property Owners**, and **Admins**.
- **Secure Auth:** JWT-based authentication with HTTP-only cookies and cross-site support (`SameSite: None`).
- **Profile Management:** Interactive lifestyle profile to find compatible roommates.

### 🏢 Property & Room Management
- **Owner Dashboard:** Easily list properties, add rooms, and manage applications.
- **Advanced Search:** Filter properties by price, location, and amenities.
- **Roommate Matching:** Algorithm-based matching using lifestyle preferences (cleanliness, pets, smoking, etc.).

### 📩 Real-time Interactions
- **Application System:** Apply for rooms and track status from your dashboard.
- **Notifications:** Stay updated on application approvals and room availability.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Tailwind CSS, Axios, Lucide React, Framer Motion |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose) |
| **Auth** | JWT, Cookie-parser |
| **Deployment** | Netlify (Frontend), Render (Backend) |

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account

### Backend Setup
1. Clone the repository and navigate to the root folder.
2. Install dependencies: `npm install`
3. Create a `.env` file from the example:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```
4. Run the server: `npm run dev`

### Frontend Setup
1. Navigate to the `client` folder.
2. Install dependencies: `npm install`
3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Run the app: `npm run dev`

---

## 🧪 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive cookie |
| `GET` | `/api/auth/me` | Get current user session |
| `GET` | `/api/properties` | List all available properties |
| `PUT` | `/api/users/lifestyle` | Update lifestyle profile |

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License
Distributed under the ISC License. 