import type { Request, Response } from "express";

import { authService } from "../services/auth.service";

class AuthController {
  async signup(req: Request, res: Response): Promise<void> {
    const result = await authService.signup(req.body);
    res.status(201).json({ data: result });
  }

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body);
    res.status(200).json({ data: result });
  }

  async me(req: Request, res: Response): Promise<void> {
    const user = await authService.getCurrentUser(req.user!.id);
    res.status(200).json({ data: user });
  }
}

export const authController = new AuthController();
