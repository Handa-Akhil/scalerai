import type { Board } from "@trello/shared";

import { BoardRepository } from "./board.repository";

export class BoardService {
  constructor(private readonly boardRepository: BoardRepository) {}

  async listBoards(): Promise<Board[]> {
    return this.boardRepository.findAll();
  }
}
