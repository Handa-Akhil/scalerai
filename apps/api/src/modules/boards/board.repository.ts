import type { Board } from "@trello/shared";

const mockBoards: Board[] = [
  {
    id: "board_1",
    name: "Product Roadmap",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "board_2",
    name: "Sprint Planning",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export class BoardRepository {
  async findAll(): Promise<Board[]> {
    return mockBoards;
  }
}
