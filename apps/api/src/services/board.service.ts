import { randomUUID } from "crypto";

import { boardRepository } from "../repositories/board.repository";
import { cardRepository } from "../repositories/card.repository";
import { listRepository } from "../repositories/list.repository";
import { userRepository } from "../repositories/user.repository";
import type { Board, BoardDetails, CreateBoardInput, UpdateBoardInput } from "../types/entities";
import { AppError } from "../utils/app-error";

export class BoardService {
  async create(input: CreateBoardInput): Promise<Board> {
    if (!input.name?.trim()) {
      throw new AppError(400, "Board name is required", "VALIDATION_ERROR");
    }

    const now = new Date().toISOString();
    const members = await userRepository.findAll();
    const board: Board = {
      id: randomUUID(),
      ownerId: input.ownerId ?? members[0]?.id,
      memberIds: members.map((member) => member.id),
      name: input.name.trim(),
      description: input.description?.trim(),
      createdAt: now,
      updatedAt: now
    };

    await boardRepository.create(board);

    return board;
  }

  async getAll(): Promise<Board[]> {
    return boardRepository.findAll();
  }

  async getById(boardId: string): Promise<Board> {
    const board = await boardRepository.findById(boardId);

    if (!board) {
      throw new AppError(404, "Board not found", "NOT_FOUND");
    }
    return board;
  }

  async getDetails(boardId: string): Promise<BoardDetails> {
    const board = await this.getById(boardId);
    const [lists, cards, members] = await Promise.all([
      listRepository.findByBoardId(boardId),
      cardRepository.findByBoardId(boardId),
      userRepository.findAll()
    ]);

    return {
      ...board,
      members: members.map(({ passwordHash, ...member }) => member),
      lists: lists.map((list) => ({
        ...list,
        cards: cards.filter((card) => card.listId === list.id)
      }))
    };
  }

  async update(boardId: string, input: UpdateBoardInput): Promise<Board> {
    const board = await this.getById(boardId);

    if (input.name !== undefined && !input.name.trim()) {
      throw new AppError(400, "Board name cannot be empty", "VALIDATION_ERROR");
    }

    board.name = input.name?.trim() ?? board.name;
    board.description = input.description?.trim() ?? board.description;
    board.updatedAt = new Date().toISOString();

    await boardRepository.update(board);

    return board;
  }

  async remove(boardId: string): Promise<void> {
    const removed = await boardRepository.delete(boardId);
    if (!removed) {
      throw new AppError(404, "Board not found", "NOT_FOUND");
    }
  }
}

export const boardService = new BoardService();
