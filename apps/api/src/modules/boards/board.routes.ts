import { Router } from "express";

import { BoardController } from "./board.controller";
import { BoardRepository } from "./board.repository";
import { BoardService } from "./board.service";

const boardRepository = new BoardRepository();
const boardService = new BoardService(boardRepository);
const boardController = new BoardController(boardService);

export const boardRoutes = Router();

boardRoutes.get("/", boardController.listBoards);
