import { Router } from "express";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";

import { AppDataSource } from "./data-source";
import { User } from "./entity/User";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

const userRepository = AppDataSource.getRepository(User);

// Helper function to generate JWT
const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1d" });
};

// POST /auth/register: Create a new user and return a JWT so the user is immediately logged in.
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }

  try {
    //  Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert the new user using TypeORM
    const newUser = userRepository.create({
      username,
      password_hash,
    });
    const savedUser = await userRepository.save(newUser);

    // Generate a token for immediate login
    const token = generateToken(savedUser.id);

    res.status(201).json({
      id: savedUser.id,
      username: savedUser.username,
      token,
    });
  } catch (error) {
    // Check if the error is due to a unique constraint violation
    if (error.code === "23505") {
      return res.status(409).send("Username already exists.");
    }
    console.error("Registration error:", error);
    res.status(500).send("Server error during registration.");
  }
});

// POST /auth/login: Authenticate a user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username, explicitly selecting the password hash
    const user = await userRepository.findOne({
      where: { username },
      select: ["id", "password_hash", "username"],
    });

    if (!user) {
      return res.status(401).send("Invalid username or password.");
    }

    //  Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).send("Invalid username or password.");
    }

    // Generate a token
    const token = generateToken(user.id);

    res.status(200).json({
      id: user.id,
      username: user.username,
      token,
    });
  } catch (error) {
    console.error("Login error: ", error);
    res.status(500).send("Server error during login.");
  }
});

export default router;
