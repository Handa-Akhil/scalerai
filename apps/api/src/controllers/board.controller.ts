import type { Request, Response } from "express";

import { boardService } from "../services/board.service";

class BoardController {
  async create(req: Request, res: Response): Promise<void> {
    const board = await boardService.create(req.body);
    res.status(201).json({ data: board });
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    const boards = await boardService.getAll();
    res.status(200).json({ data: boards });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { boardId } = req.params as { boardId: string };
    const board = await boardService.getById(boardId);
    res.status(200).json({ data: board });
  }

  async getDetails(req: Request, res: Response): Promise<void> {
    const { boardId } = req.params as { boardId: string };
    const board = await boardService.getDetails(boardId);
    res.status(200).json({ data: board });
  }

  async update(req: Request, res: Response): Promise<void> {
    const { boardId } = req.params as { boardId: string };
    const board = await boardService.update(boardId, req.body);
    res.status(200).json({ data: board });
  }

  async remove(req: Request, res: Response): Promise<void> {
    const { boardId } = req.params as { boardId: string };
    await boardService.remove(boardId);
    res.status(204).send();
  }
}

export const boardController = new BoardController();
