# Shinoo

A modern, real-time chat application built with **Node.js**, **Express**, **MongoDB**, **React**, and **Socket.IO**. Features secure JWT authentication, live messaging, online presence tracking, and Arcjet protection against bots and rate limiting.

![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.21-black?logo=express)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-8-green?logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-red?logo=socket.io)
![License](https://img.shields.io/badge/License-ISC-yellow)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [System Architecture](#system-architecture)
- [Authentication & Security](#authentication--security)
- [Database Overview](#database-overview)
- [API Documentation](#api-documentation)
- [Socket.IO Events](#socketio-events)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Key Engineering Concepts](#key-engineering-concepts)
- [Current Limitations](#current-limitations)
- [Future Improvements](#future-improvements)

---

## Features

✨ **Core Functionality**
- User registration and login with JWT authentication
- Real-time messaging using Socket.IO
- Contact list and active chat history
- Online presence detection
- Profile picture upload (Cloudinary integration)
- Optimistic UI updates for seamless messaging

🔒 **Security & Protection**
- Secure password hashing with bcryptjs
- HTTP-only, SameSite cookies
- CORS protection
- Arcjet rate limiting (100 requests/60s)
- Bot detection and blocking
- Shield protection against common attacks (SQL injection, XSS)

📱 **User Experience**
- Responsive design with Tailwind CSS & DaisyUI
- Real-time notifications with react-hot-toast
- Dark theme with animated borders
- Sound toggle for notifications
- Session persistence

---

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** (20+) | JavaScript runtime |
| **Express** (4.21) | Web framework |
| **MongoDB** (8) | NoSQL database |
| **Mongoose** (8.10) | MongoDB ODM |
| **Socket.IO** (4.8) | Real-time communication |
| **JWT** (9.0) | Token-based authentication |
| **bcryptjs** (2.4) | Password hashing |
| **Cloudinary** (2.5) | Image hosting & optimization |
| **Arcjet** (1.0-beta) | Bot detection & rate limiting |
| **CORS** (2.8) | Cross-origin security |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React** (19) | UI library |
| **Vite** (8.1) | Build tool & dev server |
| **React Router** (8.3) | Client-side routing |
| **Zustand** (5.0) | State management |
| **Axios** (1.19) | HTTP client |
| **Socket.IO Client** (4.8) | Real-time client |
| **Tailwind CSS** (3.4) | Utility-first CSS |
| **DaisyUI** (4.12) | Component library |
| **Lucide React** (1.33) | Icon library |
| **React Hot Toast** (2.6) | Toast notifications |

---

## Project Structure

```
Shinoo/
├── backend/
│   ├── src/
│   │   ├── server.js                 # Express app entry point
│   │   ├── controllers/
│   │   │   ├── authController.js     # Sign up, login, logout
│   │   │   ├── messageController.js  # Message operations
│   │   │   └── userController.js     # Profile updates
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # Auth endpoints
│   │   │   ├── messageRoutes.js      # Message endpoints
│   │   │   └── userRoutes.js         # User endpoints
│   │   ├── models/
│   │   │   ├── userModel.js          # User schema
│   │   │   └── messageModel.js       # Message schema
│   │   ├── middlewares/
│   │   │   ├── protectRoute.js       # JWT verification
│   │   │   ├── socketAuthMiddleware.js # Socket.IO auth
│   │   │   └── arcjetProtection.js   # Rate limiting & bot detection
│   │   └── lib/
│   │       ├── db.js                 # MongoDB connection
│   │       ├── socket.js             # Socket.IO setup
│   │       ├── utils.js              # JWT token generation
│   │       ├── cloudinary.js         # Image upload config
│   │       └── arcjet.js             # Arcjet configuration
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                   # Main app component
│   │   ├── main.jsx                  # React entry point
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignUpPage.jsx
│   │   │   └── ChatPage.jsx
│   │   ├── components/
│   │   │   ├── ChatContainer.jsx
│   │   │   ├── ChatsList.jsx
│   │   │   ├── ContactList.jsx
│   │   │   ├── ProfileHeader.jsx
│   │   │   ├── ActiveTabSwitch.jsx
│   │   │   ├── BorderAnimatedContainer.jsx
│   │   │   ├── NoConversationPlaceholder.jsx
│   │   │   └── PageLoader.jsx
│   │   ├── store/
│   │   │   ├── useAuthStore.js       # Auth state (Zustand)
│   │   │   └── useChatStore.js       # Chat state (Zustand)
│   │   ├── lib/
│   │   │   └── axios.js              # Axios instance with interceptors
│   │   └── index.css                 # Tailwind styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
├── .env.example                       # Environment variables template
└── package.json                       # Root package.json
```

---

## System Architecture

### High-Level Overview

```mermaid
graph TB
    Client["🖥️ React Frontend<br/>(Vite + Zustand)"]
    Server["⚙️ Express Server<br/>(Node.js)"]
    DB["🗄️ MongoDB<br/>(User + Message)"]
    Socket["🔌 Socket.IO<br/>(Real-time)"]
    Arcjet["🛡️ Arcjet<br/>(Rate Limit + Bot)"]
    Cloudinary["☁️ Cloudinary<br/>(Image Storage)"]

    Client -->|HTTP Requests| Server
    Client -->|WebSocket| Socket
    Server -->|Query/Update| DB
    Server -->|Socket Events| Socket
    Server -->|API Calls| Arcjet
    Server -->|Upload| Cloudinary
    Arcjet -.->|Protection| Server
    Cloudinary -.->|Image URL| Server

    style Client fill:#61dafb,stroke:#333,stroke-width:2px,color:#000
    style Server fill:#90c53f,stroke:#333,stroke-width:2px,color:#000
    style DB fill:#13aa52,stroke:#333,stroke-width:2px,color:#fff
    style Socket fill:#f25648,stroke:#333,stroke-width:2px,color:#fff
    style Arcjet fill:#6b7280,stroke:#333,stroke-width:2px,color:#fff
    style Cloudinary fill:#3448c5,stroke:#333,stroke-width:2px,color:#fff
```

---

## Authentication & Security

### JWT Authentication Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Client as React Client
    participant Server as Express Server
    participant DB as MongoDB
    participant Cookie as HTTP Cookie

    User->>Client: Enter credentials (email, password)
    Client->>Server: POST /api/auth/signup or /login
    Server->>DB: Query user by email
    alt User exists (Login)
        DB-->>Server: User document
        Server->>Server: bcrypt.compare(password, hash)
        alt Password matches
            Server->>Server: generateToken(userId)
            Server->>Cookie: Set JWT cookie (7d expiry)
            Server-->>Client: 200 + user data
            Client->>Client: Store authUser in Zustand
        else Password invalid
            Server-->>Client: 400 Invalid credentials
        end
    else New user (Signup)
        Server->>Server: bcrypt.hash(password, salt=10)
        Server->>DB: Create new user
        DB-->>Server: User created
        Server->>Server: generateToken(userId)
        Server->>Cookie: Set JWT cookie (7d expiry)
        Server-->>Client: 201 + user data
        Client->>Client: Store authUser in Zustand
    end

    Note over Client,Server: Cookie: jwt token (httpOnly, sameSite=strict)
    Note over Server: Headers: CORS origin check
```

**Security Features:**
- Passwords hashed with bcryptjs (salt rounds: 10)
- HTTP-only cookies prevent XSS attacks
- SameSite=strict prevents CSRF attacks
- Secure flag enabled in production
- 7-day token expiration
- Token verified on every protected route

---

### Socket.IO Authentication Flow

```mermaid
sequenceDiagram
    participant Client as React Client
    participant SocketIO as Socket.IO Server
    participant Auth as socketAuthMiddleware
    participant DB as MongoDB
    participant Handler as Connection Handler

    Client->>SocketIO: Connect (handshake with cookies)
    SocketIO->>Auth: Intercept connection
    Auth->>Auth: Extract JWT from cookie header
    alt Token present
        Auth->>Auth: jwt.verify(token, JWT_SECRET)
        Auth->>DB: userModel.findById(userId)
        alt User found
            DB-->>Auth: User document
            Auth->>Auth: Attach user & userId to socket
            Auth->>SocketIO: Proceed to handler
            SocketIO->>Handler: Emit 'connection' event
            Handler->>Handler: Add userId to userSocketMap
            Handler->>SocketIO: io.emit('getOnlineUsers', [...])
            SocketIO-->>Client: Receive online users list
        else User not found
            Auth-->>SocketIO: Error: User not found
            SocketIO-->>Client: Connection rejected
        end
    else No token
        Auth-->>SocketIO: Error: No token provided
        SocketIO-->>Client: Connection rejected
    end

    Note over Client,SocketIO: withCredentials: true
    Note over Auth: Middleware runs before connection accepted
    Note over Handler: socket.user and socket.userId now available
```

**Implementation:**
- JWT extracted from HTTP cookie header
- Token verified before Socket.IO connection accepted
- User document attached to socket object
- Enables access to `socket.user` and `socket.userId` in handlers

---

## Real-Time Message Flow

### Message Sending & Delivery (HTTP + Socket.IO Sync)

```mermaid
sequenceDiagram
    participant Sender as Sender<br/>React
    participant SenderServer as Sender<br/>Server
    participant DB as MongoDB
    participant ReceiverSocket as Receiver<br/>Socket.IO
    participant Receiver as Receiver<br/>React

    Sender->>Sender: User types & clicks send
    Sender->>Sender: Optimistic message added to UI
    Sender->>SenderServer: POST /api/messages/send/:id<br/>(text, image)
    
    SenderServer->>SenderServer: Arcjet rate limit check
    SenderServer->>SenderServer: protectRoute verify JWT
    
    alt Image included
        SenderServer->>SenderServer: cloudinary.uploader.upload(image)
        SenderServer->>SenderServer: Get secure_url
    end
    
    SenderServer->>DB: messageModel.create({senderId, receiverId, text, image})
    DB-->>SenderServer: Message saved with timestamp & _id
    
    SenderServer->>ReceiverSocket: getReceiverSocketIds(receiverId)
    alt Receiver online (socket connected)
        ReceiverSocket->>ReceiverSocket: io.to(socketId).emit('newMessage', message)
        ReceiverSocket-->>Receiver: Receive message in real-time
        Receiver->>Receiver: Add to messages array
        Receiver->>Receiver: Play sound (if enabled)
        Receiver->>Receiver: Show toast notification
    else Receiver offline
        Note over SenderServer: Message stored in DB for later retrieval
    end
    
    SenderServer-->>Sender: 201 + saved message with DB _id
    Sender->>Sender: Replace optimistic msg with actual DB version

    Note over SenderServer,DB: Message persisted to database
    Note over SenderServer,ReceiverSocket: Real-time delivery if online
    Note over Sender: Optimistic UI (instant feedback)
```

**Key Points:**
- **Optimistic Updates:** Message appears instantly in sender's UI
- **Persistence:** All messages stored in MongoDB
- **Real-time Delivery:** Socket.IO pushes message to online receivers
- **Offline Handling:** Receivers fetch messages via HTTP when they reconnect
- **Image Upload:** Cloudinary integration for image storage

---

### Message Retrieval (HTTP) - GET History

```mermaid
sequenceDiagram
    participant User as User<br/>React
    participant Server as Express Server
    participant DB as MongoDB

    User->>Server: GET /api/messages/:userId
    Server->>Server: protectRoute verify JWT
    
    Server->>DB: messageModel.find({<br/>$or: [{senderId, receiverId}, {receiverId, senderId}]<br/>})
    DB-->>Server: Message documents (sorted by timestamp)
    
    Server-->>User: 200 + message array
    User->>User: Load into messages state
    User->>User: Render chat history

    Note over DB: Bidirectional query: sender OR receiver
    Note over Server: Middleware validates authentication
```

---

### Online Presence Flow

```mermaid
sequenceDiagram
    participant User1 as User 1<br/>React
    participant Socket1 as Socket.IO<br/>(User 1)
    participant OnlineMap as userSocketMap<br/>(Map&lt;userId, Set&lt;socketId&gt;&gt;)
    participant User2 as User 2<br/>React
    participant Socket2 as Socket.IO<br/>(User 2)

    User1->>Socket1: io.connect() with JWT
    Socket1->>OnlineMap: User 1 connects<br/>userId → {socketId}
    OnlineMap->>Socket1: io.emit('getOnlineUsers', [userId1, ...])
    Socket1-->>User1: Receive online users list
    User1->>User1: Set onlineUsers in Zustand

    User2->>Socket2: io.connect() with JWT
    Socket2->>OnlineMap: User 2 connects<br/>userId → {socketId}
    OnlineMap->>Socket2: io.emit('getOnlineUsers', [userId1, userId2, ...])
    Socket2-->>User2: Receive updated online users
    User2->>User2: Update onlineUsers in Zustand
    
    Note over OnlineMap: Broadcast to ALL connected users
    Socket1-->>User1: UPDATED online users list
    User1->>User1: Render green indicator next to User 2

    rect rgb(200, 150, 255)
        Note over User1,User2: Online status now in sync across all clients
    end

    User1->>Socket1: Disconnect (window closed)
    Socket1->>OnlineMap: Remove User 1
    OnlineMap->>OnlineMap: Broadcast new list
    OnlineMap->>Socket2: io.emit('getOnlineUsers', [userId2, ...])
    Socket2-->>User2: User 1 no longer online
    User2->>User2: Remove User 1 from onlineUsers
```

**Implementation:**
- `userSocketMap`: `Map<userId, Set<socketId>>`
  - One user can have multiple socket connections
  - Maps each userId to a Set of active socketIds
- **Broadcast Strategy:** `io.emit()` sends to all connected clients
- **Disconnection Handling:** Socket is removed from map, broadcast sent
- **Multi-device Support:** Set handles multiple concurrent connections

---

## Database Overview

### User Schema

```javascript
{
  _id: ObjectId,
  fullName: String,        // Unique, 3-20 characters
  email: String,           // Unique, validated format
  password: String,        // Hashed with bcryptjs (10 rounds)
  profilePic: String,      // URL (Cloudinary), default: ""
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Indexes:**
- `fullName` (unique)
- `email` (unique)

---

### Message Schema

```javascript
{
  _id: ObjectId,
  senderId: ObjectId,      // Reference to User
  receiverId: ObjectId,    // Reference to User
  text: String,            // Optional
  image: String,           // URL (Cloudinary), optional
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Queries:**
- Find messages between two users: `$or: [{senderId, receiverId}, {receiverId, senderId}]`
- Get all conversations: Messages grouped by unique partner IDs

---

## API Documentation

### Authentication Endpoints

#### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "_id": "507f1f77bcf86cd799439011",
  "fullName": "John Doe",
  "email": "john@example.com",
  "profilePic": ""
}
```

**Errors:**
- `400`: Missing fields, invalid format, length constraints
- `400`: Email already exists
- `403`: Arcjet rate limit exceeded
- `403`: Bot detected
- `500`: Server error

**Security:** Password hashed (10 rounds), JWT cookie set (7d expiry)

---

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "_id": "507f1f77bcf86cd799439011",
  "fullName": "John Doe",
  "email": "john@example.com",
  "profilePic": "https://cloudinary.com/..."
}
```

**Errors:**
- `400`: Missing fields
- `400`: Invalid credentials
- `403`: Rate limit exceeded
- `403`: Bot detected
- `500`: Server error

---

#### Logout
```http
POST /api/auth/logout
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

**Action:** Clears JWT cookie

---

#### Check Authentication
```http
GET /api/auth/check
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "fullName": "John Doe",
  "email": "john@example.com",
  "profilePic": "https://cloudinary.com/...",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Errors:**
- `401`: Unauthenticated (no/invalid JWT)

---

### Message Endpoints

#### Get All Contacts (Except Self)
```http
GET /api/messages/contacts
Authorization: Bearer <JWT>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "profilePic": "https://cloudinary.com/..."
  },
  ...
]
```

**Errors:**
- `401`: Unauthenticated
- `403`: Rate limit exceeded
- `500`: Server error

---

#### Get All Chat Partners (Users You've Messaged)
```http
GET /api/messages/chats
Authorization: Bearer <JWT>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "profilePic": "https://cloudinary.com/..."
  },
  ...
]
```

---

#### Get Messages with Specific User
```http
GET /api/messages/:userId
Authorization: Bearer <JWT>
```

**Response (200):**
```json
[
  {
    "_id": "607f1f77bcf86cd799439013",
    "senderId": "507f1f77bcf86cd799439011",
    "receiverId": "507f1f77bcf86cd799439012",
    "text": "Hello!",
    "image": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "607f1f77bcf86cd799439014",
    "senderId": "507f1f77bcf86cd799439012",
    "receiverId": "507f1f77bcf86cd799439011",
    "text": "Hi there!",
    "image": null,
    "createdAt": "2024-01-15T10:31:00.000Z",
    "updatedAt": "2024-01-15T10:31:00.000Z"
  }
]
```

---

#### Send Message
```http
POST /api/messages/send/:userId
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "text": "Hello!",
  "image": "data:image/png;base64,..."  // Optional
}
```

**Response (201):**
```json
{
  "_id": "607f1f77bcf86cd799439015",
  "senderId": "507f1f77bcf86cd799439011",
  "receiverId": "507f1f77bcf86cd799439012",
  "text": "Hello!",
  "image": "https://cloudinary.com/...",
  "createdAt": "2024-01-15T10:32:00.000Z",
  "updatedAt": "2024-01-15T10:32:00.000Z"
}
```

**Process:**
1. Arcjet rate limit check
2. JWT verification
3. Optional: Cloudinary image upload
4. Message saved to MongoDB
5. Real-time delivery via Socket.IO (if receiver online)

**Errors:**
- `401`: Unauthenticated
- `403`: Rate limit exceeded
- `500`: Server error

---

### User Endpoints

#### Update Profile Picture
```http
PUT /api/user/update-profile
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "profilePic": "data:image/png;base64,..."
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "fullName": "John Doe",
  "email": "john@example.com",
  "profilePic": "https://cloudinary.com/...",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:32:00.000Z"
}
```

**Errors:**
- `400`: Profile picture missing
- `401`: Unauthenticated
- `403`: Rate limit exceeded
- `500`: Server error

---

## Socket.IO Events

### Server → Client Events

#### `getOnlineUsers`
Emitted when user connects/disconnects. Broadcasts to all connected clients.

```javascript
socket.on("getOnlineUsers", (userIds) => {
  // userIds: Array of ObjectIds of currently online users
  set({ onlineUsers: userIds });
});
```

**Example:**
```json
["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
```

**Trigger:** 
- User connects (after auth)
- User disconnects

---

#### `newMessage`
Emitted when message is sent to an online user.

```javascript
socket.on("newMessage", (message) => {
  // Only receiver gets this event
  // message: Full message document from MongoDB
});
```

**Example:**
```json
{
  "_id": "607f1f77bcf86cd799439015",
  "senderId": "507f1f77bcf86cd799439011",
  "receiverId": "507f1f77bcf86cd799439012",
  "text": "Hello!",
  "image": "https://cloudinary.com/...",
  "createdAt": "2024-01-15T10:32:00.000Z",
  "updatedAt": "2024-01-15T10:32:00.000Z"
}
```

**Trigger:** `POST /api/messages/send/:userId` when receiver is online

---

### Implementation Details

**Connection Setup (Frontend - useAuthStore):**
```javascript
connectSocket: () => {
  const socket = io(BASE_URL, { withCredentials: true });
  socket.connect();
  
  socket.on("getOnlineUsers", (userIds) => {
    set({ onlineUsers: userIds });
  });
}
```

**Subscription (Frontend - useChatStore):**
```javascript
subscribeToNewMessages: () => {
  const { socket } = useAuthStore.getState();
  
  socket?.on("newMessage", (newMessage) => {
    set((state) => ({
      messages: [...state.messages, newMessage]
    }));
    // Play sound, show toast
  });
}
```

---

## Setup & Installation

### Prerequisites
- Node.js 20+
- MongoDB 8+ (local or cloud - MongoDB Atlas)
- npm or yarn
- Cloudinary account (free tier available)
- Arcjet account (free tier available)

### Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file (use .env.example as template)
cp ../.env.example .env

# 4. Configure environment variables
# Edit .env with your values (see Environment Variables section)

# 5. Start development server
npm run dev

# 6. Start production server
npm start
```

**Server runs on:** `http://localhost:3000` (or port specified in `.env`)

---

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env file for frontend (if needed)
# The backend URL is configured in useAuthStore.js
# For development: http://localhost:3000
# For production: / (same domain)

# 4. Start development server
npm run dev

# 5. Build for production
npm run build

# 6. Preview production build
npm run preview
```

**Dev server runs on:** `http://localhost:5173`

---

### Full Stack Development

```bash
# From root directory - Install both backend and frontend
npm run build

# From root directory - Start backend (which serves frontend in production)
npm start
```

---

## Environment Variables

### Backend `.env.example`

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
NODE_ENV=development          # Options: development, production
PORT=3000                      # Server port

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/shinoo?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars

# Frontend URL (CORS)
CLIENT_URL=http://localhost:5173  # Dev: Vite dev server
                                   # Prod: Your domain

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Arcjet (Rate Limiting & Bot Detection)
ARCJET_KEY=ajk_your_arcjet_key_here
```

### Getting Keys

**MongoDB Atlas:**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster (free tier available)
3. Generate connection string
4. Add your IP to IP whitelist

**Cloudinary:**
1. Sign up at https://cloudinary.com
2. Dashboard → API Keys → Copy credentials
3. Free tier: 25 GB storage, 25 million transformations/month

**Arcjet:**
1. Sign up at https://arcjet.com
2. Create project
3. Copy API key
4. Free tier: 100k requests/month

---

## Key Engineering Concepts

### 1. Optimistic UI Updates
**Pattern:** Update UI immediately, sync with server in background

```javascript
// Frontend: Add message to UI instantly
const optimisticMessage = { _id: tempId, text, senderId, ... };
set((state) => ({ messages: [...state.messages, optimisticMessage] }));

// Simultaneously send to server
const response = await axiosInstance.post(`/messages/send/:id`, messageData);

// Replace optimistic message with actual DB version
set((state) => {
  const idx = state.messages.findIndex(msg => msg._id === tempId);
  const nxt = [...state.messages];
  nxt[idx] = response.data;  // DB _id, timestamps, etc.
  return { messages: nxt };
});
```

**Benefits:** Instant feedback, better UX, seamless feel

---

### 2. Real-Time Sync: HTTP + Socket.IO Dual Approach
**Problem:** Receiver offline during message send - message would be lost
**Solution:** 

1. **Persistence Layer (HTTP):** Always save to database
2. **Real-time Layer (Socket.IO):** Deliver instantly if online

```javascript
// Backend: Send message
const message = await messageModel.create({...});  // Saved to DB

// Check if receiver is online
const receiverSocketIds = getReceiverSocketIds(receiverId);
if (receiverSocketIds) {
  // Receiver online: Real-time delivery
  receiverSocketIds.forEach((socketId) => {
    io.to(socketId).emit("newMessage", message);
  });
}
// If offline, message stays in DB - receiver fetches on reconnect
```

**Guarantees:** No message loss, instant delivery when possible

---

### 3. Multi-Connection User Tracking
**Pattern:** One user, multiple devices/windows

```javascript
// userSocketMap: Map<userId, Set<socketId>>
const userSocketMap = new Map();

socket.on("connection", (socket) => {
  const sockets = userSocketMap.get(socket.userId) ?? new Set();
  sockets.add(socket.id);        // Add this connection
  userSocketMap.set(socket.userId, sockets);
});

socket.on("disconnect", () => {
  const sockets = userSocketMap.get(socket.userId);
  sockets.delete(socket.id);     // Remove this connection
  if (sockets.size === 0) {
    userSocketMap.delete(socket.userId);  // User fully offline
  }
});
```

**Benefit:** Support for multi-device usage

---

### 4. Middleware Chaining for Security
**Pattern:** Multiple middleware layers, each adds validation

```javascript
// messageRoutes.js
router.use(arcjetProtection, protectRoute);  // Applied to all routes

// Per-route example:
router.post("/send/:id", sendMessage);  // Inherits arcjetProtection + protectRoute
```

**Execution Order:**
1. `arcjetProtection`: Rate limit, bot detection
2. `protectRoute`: JWT verification, user loading
3. `sendMessage` handler

**Benefit:** Centralized security, reusable across routes

---

### 5. State Management with Zustand
**Why Zustand over Redux?**
- Minimal boilerplate
- Simpler API
- No provider wrapper needed (optional)
- Built-in immer middleware for immutability

```javascript
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();  // Access other actions via get()
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  
  connectSocket: () => {
    // Can call other actions or access state
    const { authUser } = get();
    if (!authUser) return;
    // ...
  }
}));
```

---

### 6. JWT Cookie-Based Authentication
**Why Cookies over LocalStorage?**
- Automatic sent with every HTTP request
- HTTP-only: inaccessible to JavaScript (XSS protection)
- SameSite: prevents CSRF attacks

```javascript
// Backend: Set cookie
res.cookie("jwt", token, {
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
  httpOnly: true,                     // Can't access via JS
  sameSite: "strict",                 // CSRF protection
  secure: NODE_ENV === "production"   // HTTPS only in prod
});

// Frontend: Automatically sent by axios
// No manual header manipulation needed
const response = await axiosInstance.post("/auth/login", data);
// JWT cookie sent automatically in request
```

---

### 7. CORS with Credentials
**Configuration:**
```javascript
// Backend: Express CORS
app.use(cors({ 
  origin: process.env.CLIENT_URL,  // Specific origin, not "*"
  credentials: true                 // Allow cookies
}));

// Frontend: Axios config
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true             // Include cookies in requests
});

// Socket.IO
const socket = io(BASE_URL, { 
  withCredentials: true             // Include cookies in handshake
});
```

**Why:** Without `credentials: true`, cookies won't be sent in cross-origin requests

---

### 8. Image Upload with Cloudinary
**Flow:** Base64 string → Upload → Secure URL stored in DB

```javascript
// Frontend: Canvas/File → Base64
const image = "data:image/png;base64,iVBORw0KGgoAAAANS..."

// Backend: Upload & Store URL
if (image) {
  const uploadResponse = await cloudinary.uploader.upload(image);
  imageURL = uploadResponse.secure_url;  // https://res.cloudinary.com/...
}

// Database: Store only URL
const message = await messageModel.create({
  text,
  image: imageURL  // String, not the actual image
});
```

**Benefits:** CDN distribution, automatic optimization, file management

---

## Current Limitations

### Privacy & Data Concerns

1. **No End-to-End Encryption**
   - Messages stored in plaintext in database
   - Server admins can view message content
   - Network traffic not encrypted at application level

2. **No Message Deletion**
   - Messages cannot be deleted once sent
   - Permanent storage in MongoDB

3. **No User Blocking/Reporting**
   - Any authenticated user can message any other user
   - No moderation tools

4. **Message Content Not Validated**
   - No filtering for inappropriate content
   - No NSFW detection

5. **Profile Visibility**
   - All users can see all other users' profiles
   - No privacy settings or visibility controls

### Technical Limitations

1. **No Message Search**
   - Cannot search through past messages
   - No indexing on message content

2. **No Typing Indicators**
   - No real-time "user is typing..." feedback

3. **No Message Reactions**
   - Cannot react with emojis or other reactions

4. **No Group Chats**
   - Only 1-to-1 messaging supported
   - No multi-user conversations

5. **No Message Read Receipts**
   - Cannot see if message was read
   - No "seen at" timestamps

---

## Future Improvements

### Phase 1: Core Features
- [ ] Typing indicators ("User is typing...")
- [ ] Message read receipts (seen/unseen)
- [ ] Message deletion & editing
- [ ] Search through message history
- [ ] User presence (last seen timestamp)

### Phase 2: Advanced Features
- [ ] Group chats & communities
- [ ] Voice/video calling
- [ ] File sharing (documents, videos)
- [ ] Message reactions & emoji support
- [ ] Message forwarding

### Phase 3: Security & Privacy
- [ ] End-to-end encryption (E2EE)
- [ ] User blocking & reporting
- [ ] Content moderation & filtering
- [ ] Data export & deletion endpoints
- [ ] Privacy settings & visibility controls

### Phase 4: Performance & Scale
- [ ] Message pagination
- [ ] Caching layer (Redis)
- [ ] Database sharding for large datasets
- [ ] CDN for static assets
- [ ] Load balancing for multiple server instances

### Phase 5: User Experience
- [ ] Dark/light theme toggle
- [ ] Message pin/star feature
- [ ] Custom status messages
- [ ] User profile customization
- [ ] Notification preferences

### Phase 6: Social Features
- [ ] Friend requests & connections
- [ ] User discovery/search
- [ ] Mutual friend indicators
- [ ] Share user profiles
- [ ] Social graph analysis

---

## Contributing

This is a personal project. For bug reports or feature requests, please open an issue.

---

## Quick Links

- **Frontend Repository:** `/frontend`
- **Backend Repository:** `/backend`
- **Bugs & Issues:** [GitHub Issues](https://github.com/anik8C/Shinoo/issues)
- **Documentation Folder:** `/docs`

---

**Built with ❤️ by [anik8C](https://github.com/anik8C)**
