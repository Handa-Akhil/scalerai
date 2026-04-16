import type { Request, Response } from "express";

import { cardService } from "../services/card.service";

class CardController {
  async create(req: Request, res: Response): Promise<void> {
    const card = await cardService.create(req.body);
    res.status(201).json({ data: card });
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    const cards = await cardService.getAll();
    res.status(200).json({ data: cards });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { cardId } = req.params as { cardId: string };
    const card = await cardService.getById(cardId);
    res.status(200).json({ data: card });
  }

  async update(req: Request, res: Response): Promise<void> {
    const { cardId } = req.params as { cardId: string };
    const card = await cardService.update(cardId, req.body);
    res.status(200).json({ data: card });
  }

  async move(req: Request, res: Response): Promise<void> {
    const { cardId } = req.params as { cardId: string };
    const card = await cardService.move(cardId, req.body);
    res.status(200).json({ data: card });
  }

  async remove(req: Request, res: Response): Promise<void> {
    const { cardId } = req.params as { cardId: string };
    await cardService.remove(cardId);
    res.status(204).send();
  }
}

export const cardController = new CardController();
