import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { userRepository } from "../repositories/user.repository";
import type { LoginInput, PublicUser, SignupInput, User } from "../types/entities";
import { AppError } from "../utils/app-error";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

type AuthResult = {
  token: string;
  user: PublicUser;
};

export class AuthService {
  async signup(input: SignupInput): Promise<AuthResult> {
    const name = input.name?.trim();
    const email = input.email?.trim().toLowerCase();
    const password = input.password ?? "";

    if (!name) throw new AppError(400, "Name is required", "VALIDATION_ERROR");
    if (!emailPattern.test(email)) throw new AppError(400, "Valid email is required", "VALIDATION_ERROR");
    if (!passwordPattern.test(password)) {
      throw new AppError(400, "Password must be at least 8 characters and include uppercase, lowercase, and a number", "VALIDATION_ERROR");
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) throw new AppError(409, "Email is already registered", "CONFLICT");

    const now = new Date().toISOString();
    const user: User = {
      id: randomUUID(),
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: now,
      updatedAt: now
    };

    await userRepository.create(user);
    return this.createSession(user);
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const email = input.email?.trim().toLowerCase();
    const user = await userRepository.findByEmail(email);
    if (!user || !(await bcrypt.compare(input.password ?? "", user.passwordHash))) {
      throw new AppError(401, "Invalid email or password", "AUTHENTICATION_ERROR");
    }
    return this.createSession(user);
  }

  async getCurrentUser(userId: string): Promise<PublicUser> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, "User not found", "NOT_FOUND");
    return this.toPublicUser(user);
  }

  private createSession(user: User): AuthResult {
    const token = jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, { expiresIn: "7d" });
    return { token, user: this.toPublicUser(user) };
  }

  private toPublicUser(user: User): PublicUser {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }
}

export const authService = new AuthService();
