"use client";

import { useEffect, useState } from "react";

import { getBoardDetails, getBoards } from "../api";
import type { BoardColumn, BoardMember } from "../types";

type UseBoardDataResult = {
  boardId: string | null;
  boardTitle: string;
  columns: BoardColumn[];
  members: BoardMember[];
  loading: boolean;
  error: string | null;
};

export function useBoardData(): UseBoardDataResult {
  const [boardId, setBoardId] = useState<string | null>(null);
  const [boardTitle, setBoardTitle] = useState("Board");
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const boards = await getBoards();
        const selectedBoard = boards[0];

        if (!selectedBoard) {
          setBoardId(null);
          setBoardTitle("No boards yet");
          setColumns([]);
          setMembers([]);
          return;
        }

        const boardDetails = await getBoardDetails(selectedBoard.id);

        setBoardId(boardDetails.id);
        setBoardTitle(boardDetails.name);
        setMembers(boardDetails.members);

        const mappedColumns = boardDetails.lists.map((list) => ({
          id: list.id,
          title: list.title,
          position: list.position,
          cards: list.cards.map((card) => ({
            id: card.id,
            listId: card.listId,
            title: card.title,
            description: card.description,
            dueDate: card.dueDate,
            labels: card.labels,
            checklist: card.checklist,
            members: card.members,
            comments: card.comments,
            activity: card.activity,
            position: card.position
          }))
        }));

        setColumns(mappedColumns);
      } catch (unknownError) {
        const message =
          unknownError instanceof Error ? unknownError.message : "Failed to load board data";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  return { boardId, boardTitle, columns, members, loading, error };
}
