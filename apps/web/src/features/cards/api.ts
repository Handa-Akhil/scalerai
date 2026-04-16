import { httpDelete, httpGet, httpPatch, httpPost, httpPut } from "@/lib/api-client/http";
import type { CardItem, CardResponse } from "@/features/boards/types";

export async function getCards(): Promise<CardItem[]> {
  const response = await httpGet<CardResponse>("/cards");
  return response.data;
}

type MoveCardPayload = {
  targetListId: string;
  beforeCardId?: string;
  afterCardId?: string;
};

export async function moveCard(cardId: string, payload: MoveCardPayload): Promise<void> {
  await httpPatch<{ data: CardItem }>(`/cards/${cardId}/move`, payload);
}

export async function createCard(listId: string, title: string, position: number): Promise<CardItem> {
  const response = await httpPost<{ data: CardItem }>("/cards", { listId, title, position });
  return response.data;
}

export async function updateCard(cardId: string, payload: Partial<CardItem>): Promise<CardItem> {
  const response = await httpPut<{ data: CardItem }>(`/cards/${cardId}`, payload);
  return response.data;
}

export async function deleteCard(cardId: string): Promise<void> {
  await httpDelete<void>(`/cards/${cardId}`);
}
