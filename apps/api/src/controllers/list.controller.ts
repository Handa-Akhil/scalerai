import type { Request, Response } from "express";

import { listService } from "../services/list.service";

class ListController {
  async create(req: Request, res: Response): Promise<void> {
    const list = await listService.create(req.body);
    res.status(201).json({ data: list });
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    const lists = await listService.getAll();
    res.status(200).json({ data: lists });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { listId } = req.params as { listId: string };
    const list = await listService.getById(listId);
    res.status(200).json({ data: list });
  }

  async update(req: Request, res: Response): Promise<void> {
    const { listId } = req.params as { listId: string };
    const list = await listService.update(listId, req.body);
    res.status(200).json({ data: list });
  }

  async remove(req: Request, res: Response): Promise<void> {
    const { listId } = req.params as { listId: string };
    await listService.remove(listId);
    res.status(204).send();
  }
}

export const listController = new ListController();
