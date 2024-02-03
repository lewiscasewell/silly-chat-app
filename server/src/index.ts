import express, { NextFunction, Request, Response } from "express";
import { createServer } from "http";
import { createClient } from "redis";
import { Server as SocketIO } from "socket.io";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser"; // Ensure you have this installed for handling cookies
import identifyClient from "./middleware/identify-client";
import authMiddleware, { DecodedUser } from "./middleware/auth";

// override process env to add the redis host and port
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REDIS_HOST: string;
      REDIS_PORT: string;
      NODE_ENV: "development" | "production";
      JWT_SECRET: string;
      REFRESH_TOKEN_SECRET: string;
      BASE_URL: string;
      CLIENT_URL: string;
    }
  }
}

declare global {
  namespace Express {
    interface Request {
      clientType: "web" | "mobile";
      user: DecodedUser;
    }
  }
}

declare module "socket.io" {
  interface Socket {
    decoded: DecodedUser;
  }
}

const app = express();
const server = createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});
redisClient.connect();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // Allow credentials (cookies) across domains
  })
);
app.use(express.json());
app.use(cookieParser()); // Parse cookies from the HTTP Request

export const JWT_SECRET = process.env.JWT_SECRET;
export const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Middleware to determine the client type
app.use(identifyClient);

// Socket.IO connection handling
io.on("connection", async (socket) => {
  if (socket.handshake.headers["socket-type"] === "auth") {
    if (socket.handshake.headers && socket.handshake.headers.cookie) {
      const token = socket.handshake.headers.cookie
        ?.split(";")
        ?.find((c: string) => c.trim().startsWith("accessToken="))
        ?.split("=")[1];

      try {
        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET);
          socket.decoded = decoded as DecodedUser;
        }
        await redisClient.set(`socket:${socket.id}`, socket.decoded.username);
      } catch (error) {}
    } else {
      await redisClient.set(`socket:${socket.id}`, "anonymous");
    }
  }

  socket.on("message", (message) => {
    console.log("message", message);
    socket.emit("message", message);
  });
  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${socket.id}`);
    await redisClient.del(`socket:${socket.id}`);
  });
});

// Sign-up endpoint
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .send({ error: "Username and password are required" });
  }

  const userKey = `user:${username}`;
  const userExists = await redisClient.exists(userKey);
  if (userExists) {
    return res.status(409).send({ error: "Username already taken" });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  await redisClient.set(userKey, hashedPassword);

  // Here, you might want to automatically log the user in and return tokens, but
  // for simplicity, we're just confirming user creation.
  res.status(201).send({ message: "User created successfully" });
});

// Sign-in endpoint
app.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  const userKey = `user:${username}`;
  const userPasswordHash = await redisClient.get(userKey);

  if (
    !userPasswordHash ||
    !(await bcrypt.compare(password, userPasswordHash))
  ) {
    return res.status(401).send({ error: "Invalid username or password" });
  }

  const tokens = await generateTokens({ username });

  // For web clients, send tokens as httpOnly cookies
  if (req.clientType === "web") {
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      sameSite: "strict",
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      sameSite: "strict",
    });
  }

  io.emit("auth_change", { status: "logged_in" }); // Notify all clients of the change

  // Return tokens directly to mobile clients or if web client needs them in the body
  res.json(tokens);
});

// Helper function to generate access and refresh tokens
async function generateTokens(payload: { username: string }) {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1m" });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });

  // Store the refresh token in Redis associated with the user
  const refreshKey = `refresh:${payload.username}`;
  await redisClient.set(refreshKey, refreshToken, { EX: 60 * 60 * 24 * 7 }); // Expires in 7 days

  return { accessToken, refreshToken };
}

// Refresh token endpoint
app.post("/refresh_token", async (req, res) => {
  let refreshToken;

  if (req.clientType === "web") {
    refreshToken = req.cookies.refreshToken;
  } else {
    refreshToken = req.body.refreshToken;
  }
  console.log("refreshToken", refreshToken);
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh Token Required" });
  }

  try {
    const { username } = jwt.verify(refreshToken, REFRESH_SECRET) as {
      username: string;
    };
    const storedToken = await redisClient.get(`refresh:${username}`);

    if (storedToken !== refreshToken) {
      return res.status(403).json({ error: "Invalid Refresh Token" });
    }

    const newTokens = await generateTokens({ username });

    // For web clients, send tokens as httpOnly cookies
    if (req.clientType === "web") {
      res.cookie("accessToken", newTokens.accessToken, {
        httpOnly: true,
        sameSite: "strict",
      });
      res.cookie("refreshToken", newTokens.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
      });
    }
    res.json(newTokens);
  } catch (error) {
    res.status(403).json({ error: "Invalid or Expired Refresh Token" });
  }
});

// Logout endpoint
app.post("/logout", authMiddleware, async (req, res) => {
  let refreshToken;
  if (req.clientType === "web") {
    refreshToken = req.cookies.refreshToken;
  } else {
    refreshToken = req.body.refreshToken;
  }
  try {
    const { username } = jwt.verify(refreshToken, REFRESH_SECRET) as {
      username: string;
    };
    console.log("username", username);
    await redisClient.del(`refresh:${username}`);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).send({ message: "Logged out successfully" });
    io.emit("auth_change", { status: "logged_out" }); // Notify all clients of the change
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

// Protected endpoint example
app.get("/protected", authMiddleware, async (req, res) => {
  res.send({ timestamp: Date.now() });
});

app.post("/send-message", authMiddleware, async (req, res) => {
  const { message } = req.body;
  const username = req.user.username;
  io.emit("message", message);

  const messageKey = `messages:${Date.now()}`; // You can use a unique key for each message
  await redisClient.set(messageKey, JSON.stringify({ username, message }), {
    EX: 60 * 60 * 24,
  });

  res.send({ message: "Message sent" });
});

app.get("/is-authenticated", authMiddleware, (req, res) => {
  res.send({ status: "Authenticated" });
});

app.get("/messages", async (req, res) => {
  const keys = await redisClient.keys("messages:*");
  const messages = await Promise.all(
    keys.map(async (key) => {
      const message = await redisClient.get(key);
      if (!message) return;
      return { ...JSON.parse(message), timestamp: key.split(":")[1] };
    })
  );
  res.send(messages.filter(Boolean));
});

app.get("/active-users", async (req, res) => {
  const socketIds = await redisClient.keys("socket:*");
  console.log("socketIds", socketIds);
  const users = await Promise.all(
    socketIds.map(async (key) => {
      const username = await redisClient.get(key);
      if (!username) return;
      return { username, socketId: key.split(":")[1] };
    })
  );
  res.send(users.filter(Boolean));
});

server.listen(6969, () => console.log("Server listening on port 6969"));
