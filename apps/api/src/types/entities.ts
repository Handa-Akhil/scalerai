export type Board = {
  id: string;
  ownerId?: string;
  memberIds?: string[];
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type List = {
  id: string;
  boardId: string;
  title: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type Card = {
  id: string;
  listId: string;
  title: string;
  description?: string;
  dueDate?: string;
  labels?: { id: string; name: string; color: string }[];
  members?: { id: string; name: string; initials: string }[];
  checklist?: { id: string; text: string; done: boolean }[];
  comments?: { id: string; authorId: string; authorName: string; text: string; createdAt: string }[];
  activity?: { id: string; text: string; createdAt: string }[];
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type BoardDetails = Board & {
  members: PublicUser[];
  lists: Array<List & { cards: Card[] }>;
};

export type CreateBoardInput = {
  name: string;
  description?: string;
  ownerId?: string;
};

export type UpdateBoardInput = Partial<CreateBoardInput>;

export type CreateListInput = {
  boardId: string;
  title: string;
  position: number;
};

export type UpdateListInput = Partial<Omit<CreateListInput, "boardId">>;

export type CreateCardInput = {
  listId: string;
  title: string;
  description?: string;
  dueDate?: string;
  labels?: Card["labels"];
  members?: Card["members"];
  checklist?: Card["checklist"];
  comments?: Card["comments"];
  activity?: Card["activity"];
  position: number;
};

export type UpdateCardInput = Partial<Omit<CreateCardInput, "listId">>;

export type MoveCardInput = {
  targetListId: string;
  beforeCardId?: string;
  afterCardId?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type SignupInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};
