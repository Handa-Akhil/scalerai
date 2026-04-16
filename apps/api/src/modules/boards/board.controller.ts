import type { Request, Response } from "express";

import { BoardService } from "./board.service";

export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  listBoards = async (_req: Request, res: Response): Promise<void> => {
    const boards = await this.boardService.listBoards();

    res.status(200).json({
      data: boards
    });
  };
}
