import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "..";

export type DecodedUser = {
  username: string;
  iat: number;
  exp: number;
};

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let token;
  if (req.clientType === "web") {
    token = req.cookies.accessToken;
  } else {
    token = req.headers.authorization?.split(" ")[1];
  }

  if (!token) {
    return res.status(401).send({ error: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser;
    req.user = decoded;
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    return res.status(401).send({ error: "Invalid or expired token" });
  }
};

export default authMiddleware;
