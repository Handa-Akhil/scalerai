import { randomUUID } from "crypto";

import { cardRepository } from "../repositories/card.repository";
import { listRepository } from "../repositories/list.repository";
import type {
  Card,
  CreateCardInput,
  MoveCardInput,
  UpdateCardInput
} from "../types/entities";
import { AppError } from "../utils/app-error";

const POSITION_GAP = 1024;
const MIN_GAP_THRESHOLD = 0.0001;

export class CardService {
  async create(input: CreateCardInput): Promise<Card> {
    const listExists = await listRepository.exists(input.listId);
    if (!listExists) {
      throw new AppError(404, "List not found", "NOT_FOUND");
    }

    if (!input.title?.trim()) {
      throw new AppError(400, "Card title is required", "VALIDATION_ERROR");
    }

    const now = new Date().toISOString();
    const card: Card = {
      id: randomUUID(),
      listId: input.listId,
      title: input.title.trim(),
      description: input.description?.trim(),
      dueDate: input.dueDate,
      labels: input.labels ?? [],
      members: input.members ?? [],
      checklist: input.checklist ?? [],
      comments: input.comments ?? [],
      activity: input.activity ?? [{ id: randomUUID(), text: "Card created", createdAt: now }],
      position: input.position,
      createdAt: now,
      updatedAt: now
    };

    await cardRepository.create(card);

    return card;
  }

  async getAll(): Promise<Card[]> {
    return cardRepository.findAll();
  }

  async getById(cardId: string): Promise<Card> {
    const card = await cardRepository.findById(cardId);
    if (!card) {
      throw new AppError(404, "Card not found", "NOT_FOUND");
    }
    return card;
  }

  async update(cardId: string, input: UpdateCardInput): Promise<Card> {
    const card = await this.getById(cardId);

    if (input.title !== undefined && !input.title.trim()) {
      throw new AppError(400, "Card title cannot be empty", "VALIDATION_ERROR");
    }

    card.title = input.title?.trim() ?? card.title;
    card.description = input.description?.trim() ?? card.description;
    card.dueDate = input.dueDate ?? card.dueDate;
    card.labels = input.labels ?? card.labels;
    card.members = input.members ?? card.members;
    card.checklist = input.checklist ?? card.checklist;
    card.comments = input.comments ?? card.comments;
    card.activity = input.activity ?? card.activity;
    card.position = input.position ?? card.position;
    card.updatedAt = new Date().toISOString();

    await cardRepository.update(card);

    return card;
  }

  async move(cardId: string, input: MoveCardInput): Promise<Card> {
    const card = await this.getById(cardId);

    if (!input.targetListId) {
      throw new AppError(400, "targetListId is required", "VALIDATION_ERROR");
    }

    const targetListExists = await listRepository.exists(input.targetListId);
    if (!targetListExists) {
      throw new AppError(404, "Target list not found", "NOT_FOUND");
    }

    if (input.beforeCardId && input.afterCardId && input.beforeCardId === input.afterCardId) {
      throw new AppError(400, "beforeCardId and afterCardId cannot be same", "VALIDATION_ERROR");
    }

    if (input.beforeCardId === cardId || input.afterCardId === cardId) {
      throw new AppError(400, "Card cannot be positioned relative to itself", "VALIDATION_ERROR");
    }

    if (input.beforeCardId) {
      await this.assertSiblingCard(input.beforeCardId, input.targetListId, "beforeCardId");
    }

    if (input.afterCardId) {
      await this.assertSiblingCard(input.afterCardId, input.targetListId, "afterCardId");
    }

    let listCards = await cardRepository.findByListId(input.targetListId, cardId);

    let nextPosition = this.computeTargetPosition(listCards, input.beforeCardId, input.afterCardId);

    if (!Number.isFinite(nextPosition)) {
      listCards = listCards.map((item, index) => ({
        id: item.id,
        position: (index + 1) * POSITION_GAP
      }));

      await cardRepository.updatePositions(listCards);

      nextPosition = this.computeTargetPosition(listCards, input.beforeCardId, input.afterCardId);
    }

    card.listId = input.targetListId;
    card.position = nextPosition;
    card.updatedAt = new Date().toISOString();

    await cardRepository.update(card);

    return card;
  }

  async remove(cardId: string): Promise<void> {
    const removed = await cardRepository.delete(cardId);
    if (!removed) {
      throw new AppError(404, "Card not found", "NOT_FOUND");
    }
  }

  private computeTargetPosition(listCards: { id: string; position: number }[], beforeCardId?: string, afterCardId?: string): number {
    const beforeCard = beforeCardId ? listCards.find((item) => item.id === beforeCardId) : undefined;
    const afterCard = afterCardId ? listCards.find((item) => item.id === afterCardId) : undefined;

    if (beforeCard && afterCard && afterCard.position >= beforeCard.position) {
      throw new AppError(400, "afterCardId must be before beforeCardId", "VALIDATION_ERROR");
    }

    if (beforeCard && afterCard) {
      const gap = beforeCard.position - afterCard.position;
      if (gap <= MIN_GAP_THRESHOLD) return Number.NaN;
      return (beforeCard.position + afterCard.position) / 2;
    }

    if (beforeCard) {
      const priorCandidates = listCards.filter((item) => item.position < beforeCard.position);
      const nearestLeft = priorCandidates.at(-1);

      if (!nearestLeft) return beforeCard.position / 2;

      const gap = beforeCard.position - nearestLeft.position;
      if (gap <= MIN_GAP_THRESHOLD) return Number.NaN;
      return (beforeCard.position + nearestLeft.position) / 2;
    }

    if (afterCard) {
      const nextCandidates = listCards.filter((item) => item.position > afterCard.position);
      const nearestRight = nextCandidates[0];

      if (!nearestRight) return afterCard.position + POSITION_GAP;

      const gap = nearestRight.position - afterCard.position;
      if (gap <= MIN_GAP_THRESHOLD) return Number.NaN;
      return (nearestRight.position + afterCard.position) / 2;
    }

    const lastCard = listCards.at(-1);
    return lastCard ? lastCard.position + POSITION_GAP : POSITION_GAP;
  }

  private async assertSiblingCard(cardId: string, targetListId: string, fieldName: string): Promise<void> {
    const card = await cardRepository.findById(cardId);
    if (!card) {
      throw new AppError(404, `${fieldName} card not found`, "NOT_FOUND");
    }
    if (card.listId !== targetListId) {
      throw new AppError(400, `${fieldName} must belong to target list`, "VALIDATION_ERROR");
    }
  }
}

export const cardService = new CardService();
