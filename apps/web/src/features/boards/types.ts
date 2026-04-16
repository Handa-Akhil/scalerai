import type { Board } from "@trello/shared";

export type BoardListResponse = {
  data: Board[];
};

export type ListItem = {
  id: string;
  boardId: string;
  title: string;
  position: number;
};

export type CardItem = {
  id: string;
  listId: string;
  title: string;
  description?: string;
  dueDate?: string;
  labels?: { id: string; name: string; color: string }[];
  checklist?: { id: string; text: string; done: boolean }[];
  members?: { id: string; name: string; initials: string }[];
  comments?: { id: string; authorId: string; authorName: string; text: string; createdAt: string }[];
  activity?: { id: string; text: string; createdAt: string }[];
  position: number;
};

export type ListResponse = {
  data: ListItem[];
};

export type CardResponse = {
  data: CardItem[];
};

export type BoardDetailsResponse = {
  data: Board & {
    members: Array<{
      id: string;
      name: string;
      email: string;
      createdAt: string;
      updatedAt: string;
    }>;
    lists: Array<
      ListItem & {
        cards: CardItem[];
      }
    >;
  };
};

export type BoardColumn = {
  id: string;
  title: string;
  position: number;
  cards: {
    id: string;
    listId: string;
    title: string;
    description?: string;
    labels?: { id: string; name: string; color: string }[];
    checklist?: { id: string; text: string; done: boolean }[];
    dueDate?: string;
    members?: { id: string; name: string; initials: string }[];
    comments?: { id: string; authorId: string; authorName: string; text: string; createdAt: string }[];
    activity?: { id: string; text: string; createdAt: string }[];
    position: number;
  }[];
};

export type BoardMember = BoardDetailsResponse["data"]["members"][number];
