import { randomUUID } from "crypto";

import { boardRepository } from "../repositories/board.repository";
import { listRepository } from "../repositories/list.repository";
import type { CreateListInput, List, UpdateListInput } from "../types/entities";
import { AppError } from "../utils/app-error";

export class ListService {
  async create(input: CreateListInput): Promise<List> {
    const board = await boardRepository.findById(input.boardId);
    if (!board) {
      throw new AppError(404, "Board not found", "NOT_FOUND");
    }

    if (!input.title?.trim()) {
      throw new AppError(400, "List title is required", "VALIDATION_ERROR");
    }

    const now = new Date().toISOString();
    const list: List = {
      id: randomUUID(),
      boardId: input.boardId,
      title: input.title.trim(),
      position: input.position,
      createdAt: now,
      updatedAt: now
    };

    await listRepository.create(list);

    return list;
  }

  async getAll(): Promise<List[]> {
    return listRepository.findAll();
  }

  async getById(listId: string): Promise<List> {
    const list = await listRepository.findById(listId);

    if (!list) {
      throw new AppError(404, "List not found", "NOT_FOUND");
    }
    return list;
  }

  async update(listId: string, input: UpdateListInput): Promise<List> {
    const list = await this.getById(listId);

    if (input.title !== undefined && !input.title.trim()) {
      throw new AppError(400, "List title cannot be empty", "VALIDATION_ERROR");
    }

    list.title = input.title?.trim() ?? list.title;
    list.position = input.position ?? list.position;
    list.updatedAt = new Date().toISOString();

    await listRepository.update(list);

    return list;
  }

  async remove(listId: string): Promise<void> {
    const removed = await listRepository.delete(listId);
    if (!removed) {
      throw new AppError(404, "List not found", "NOT_FOUND");
    }
  }
}

export const listService = new ListService();
