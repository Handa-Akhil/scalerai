import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

import { CardItem } from "./card-item";

type CardView = {
  id: string;
  listId: string;
  title: string;
  description?: string;
  labels?: { id: string; name: string; color: string }[];
  checklist?: { id: string; text: string; done: boolean }[];
  dueDate?: string;
  members?: { id: string; name: string; initials: string }[];
  position: number;
};

type ListColumnProps = {
  id: string;
  title: string;
  cards: CardView[];
  onOpenCard: (cardId: string) => void;
  onAddCard: (listId: string, title: string) => void;
  onRenameList: (listId: string, title: string) => void;
  onDeleteList: (listId: string) => void;
};

export function ListColumn({ id, title, cards, onOpenCard, onAddCard, onRenameList, onDeleteList }: ListColumnProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: `list:${id}`,
    data: { type: "list", listId: id }
  });

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [newCardTitle, setNewCardTitle] = useState("");

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardTitle.trim()) {
      onAddCard(id, newCardTitle);
      setNewCardTitle("");
      setIsAddingCard(false);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <section
      ref={setNodeRef}
      style={style}
      className="list-column"
      data-list-id={id}
    >
      <header className="list-column-header" {...attributes} {...listeners}>
        {isRenaming ? (
          <input
            autoFocus
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onBlur={() => {
              setIsRenaming(false);
              if (draftTitle.trim() && draftTitle !== title) onRenameList(id, draftTitle.trim());
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") {
                setDraftTitle(title);
                setIsRenaming(false);
              }
            }}
            className="list-title-input"
          />
        ) : (
          <button className="list-title-button" onClick={() => setIsRenaming(true)} type="button">
            {title}
          </button>
        )}
        <button
          className="icon-button icon-button-subtle"
          aria-label="Delete list"
          onClick={() => {
            if (window.confirm(`Delete "${title}" and all of its cards?`)) {
              onDeleteList(id);
            }
          }}
          type="button"
        >
          &#128465;
        </button>
      </header>
      
      <div className="flex-1 overflow-y-auto px-1 list-scrollbar">
        <SortableContext items={cards.map((card) => `card:${card.id}`)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 pb-1">
            {cards.map((card) => (
              <CardItem
                key={card.id}
                id={card.id}
                listId={card.listId}
                title={card.title}
                description={card.description}
                labels={card.labels}
                checklist={card.checklist}
                dueDate={card.dueDate}
                members={card.members}
                onOpen={onOpenCard}
              />
            ))}
            {cards.length === 0 ? (
              <div className="list-empty-state">
                <strong>Nothing here yet</strong>
                <span>Drop a card here or create a new task to keep momentum going.</span>
              </div>
            ) : null}
          </div>
        </SortableContext>

        {isAddingCard ? (
          <form onSubmit={handleAddCardSubmit} className="mt-1">
            <textarea
              /* eslint-disable-next-line jsx-a11y/no-autofocus */
              autoFocus
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCardSubmit(e);
                }
              }}
              placeholder="Enter a title for this card..."
              className="composer-textarea"
              rows={3}
            />
            <div className="flex items-center gap-2 mb-1">
              <button 
                type="submit" 
                className="primary-button"
              >
                Add card
              </button>
              <button 
                type="button" 
                onClick={() => setIsAddingCard(false)}
                className="close-button"
              >
                &times;
              </button>
            </div>
          </form>
        ) : null}
      </div>

      {!isAddingCard && (
        <footer className="mt-2 px-2 pt-1">
          <button 
            onClick={() => setIsAddingCard(true)}
            className="add-card-button"
          >
            <span className="text-lg leading-none">+</span> Add a card
          </button>
        </footer>
      )}
    </section>
  );
}
