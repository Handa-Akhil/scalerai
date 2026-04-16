"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";

import { ListColumn } from "./list-column";
import type { BoardColumn } from "../types";

type BoardViewProps = {
  lists: BoardColumn[];
  onDragEnd: (event: DragEndEvent) => void;
  onOpenCard: (cardId: string) => void;
  onAddList: (title: string) => void;
  onAddCard: (listId: string, title: string) => void;
  onRenameList: (listId: string, title: string) => void;
  onDeleteList: (listId: string) => void;
};

export function BoardView({ lists, onDragEnd, onOpenCard, onAddList, onAddCard, onRenameList, onDeleteList }: BoardViewProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const handleAddListSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListTitle.trim()) {
      onAddList(newListTitle);
      setNewListTitle("");
      setIsAddingList(false);
    }
  };

  return (
    <main className="board-canvas">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={lists.map((list) => `list:${list.id}`)} strategy={horizontalListSortingStrategy}>
          <div className="board-lists">
            {lists.map((list) => (
              <ListColumn
                key={list.id}
                id={list.id}
                title={list.title}
                cards={list.cards}
                onOpenCard={onOpenCard}
                onAddCard={onAddCard}
                onRenameList={onRenameList}
                onDeleteList={onDeleteList}
              />
            ))}
            
            {/* Add List Component */}
            <div className="add-list-wrapper">
              {isAddingList ? (
                <form 
                  onSubmit={handleAddListSubmit} 
                  className="add-list-form"
                >
                  <input
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="Enter list title..."
                    className="composer-input"
                  />
                  <div className="flex items-center gap-2">
                    <button 
                      type="submit" 
                      className="primary-button"
                    >
                      Add list
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsAddingList(false)}
                      className="close-button"
                    >
                      &times;
                    </button>
                  </div>
                </form>
              ) : (
                <button 
                  onClick={() => setIsAddingList(true)}
                  className="add-list-button"
                >
                  <span className="text-lg leading-none">+</span> Add another list
                </button>
              )}
            </div>
          </div>
        </SortableContext>
      </DndContext>
    </main>
  );
}
