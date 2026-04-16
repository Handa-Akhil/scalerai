import type { Board } from "@trello/shared";

import { httpDelete, httpGet, httpPost, httpPut } from "@/lib/api-client/http";

import type { BoardDetailsResponse, BoardListResponse } from "./types";

export async function getBoards(): Promise<Board[]> {
  const response = await httpGet<BoardListResponse>("/boards");
  return response.data;
}

export async function getBoardDetails(boardId: string): Promise<BoardDetailsResponse["data"]> {
  const response = await httpGet<BoardDetailsResponse>(`/boards/${boardId}/details`);
  return response.data;
}

export async function createBoard(name: string): Promise<Board> {
  const response = await httpPost<{ data: Board }>("/boards", { name });
  return response.data;
}

export async function updateBoard(boardId: string, name: string): Promise<Board> {
  const response = await httpPut<{ data: Board }>(`/boards/${boardId}`, { name });
  return response.data;
}

export async function deleteBoard(boardId: string): Promise<void> {
  await httpDelete<void>(`/boards/${boardId}`);
}
