import express from "express";
import dotenv from "dotenv";
import connectDB from "./DB/conn.js";
import authRoute from "./routes/auth.route.js";
import eventRoute from "./routes/event.route.js";
import userRoute from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import uploadRoute from "./routes/upload.route.js";
import { setIO } from "./utils/socket.js";
import jwt from "jsonwebtoken";
import User from "./models/user.model.js";

dotenv.config();

const app = express();
const server = createServer(app);
const port = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
setIO(io);

// Socket.io authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new Error('User not found'));
    }
    socket.userId = user._id.toString();
    socket.userRole = user.role;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);

  // Join a room based on their userId for targeted notifications
  socket.join(socket.userId);

  // Join role-based rooms
  socket.join(`role:${socket.userRole}`);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// CORS (frontend on Vercel talks to this API)
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // allow requests with no origin (curl, Render health checks, same-origin via proxy)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});


app.use("/uploads", express.static(path.join("uploads")));
app.use("/api/auth", authRoute);
app.use("/api/event", eventRoute);
app.use("/api/user", userRoute);
app.use("/api", uploadRoute);

// error middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message
    })
})

server.listen(port, async () => {
    await connectDB();
    console.log(`Server is running on port http://localhost:${port}`);
});
