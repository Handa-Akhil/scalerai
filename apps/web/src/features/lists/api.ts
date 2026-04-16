import { httpDelete, httpGet, httpPut, httpPost } from "@/lib/api-client/http";
import type { ListItem, ListResponse } from "@/features/boards/types";

export async function getLists(): Promise<ListItem[]> {
  const response = await httpGet<ListResponse>("/lists");
  return response.data;
}

export async function updateListPosition(listId: string, position: number): Promise<void> {
  await httpPut<{ data: ListItem }>(`/lists/${listId}`, { position });
}

export async function updateListTitle(listId: string, title: string): Promise<ListItem> {
  const response = await httpPut<{ data: ListItem }>(`/lists/${listId}`, { title });
  return response.data;
}

export async function createList(boardId: string, title: string, position: number): Promise<ListItem> {
  const response = await httpPost<{ data: ListItem }>("/lists", { boardId, title, position });
  return response.data;
}

export async function deleteList(listId: string): Promise<void> {
  await httpDelete<void>(`/lists/${listId}`);
}
