import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to verify JWT token and extract the user ID.
 * Attaches userId to the request object for use in protected routes.
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get the Authorization header from the request
  const authHeader = req.headers["authorization"];

  // Format is "Bearer TOKEN", so split to get the token part
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).send("Access denied. No token provided.");
  }

  // Verify the token using the secret key
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send("Invalid or expired token.");
    }

    req.userId = (user as { userId: number }).userId;
    next();
  });
};
