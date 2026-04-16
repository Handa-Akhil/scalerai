"use client";

import type { BoardColumn } from "../types";

type BoardInsightsProps = {
  lists: BoardColumn[];
  onOpenCard: (cardId: string) => void;
};

export function BoardInsights({ lists, onOpenCard }: BoardInsightsProps) {
  const cards = lists.flatMap((list) => list.cards);
  const checklistItems = cards.flatMap((card) => card.checklist ?? []);
  const completedItems = checklistItems.filter((item) => item.done).length;
  const todayDate = new Date().toISOString().slice(0, 10);
  const dueToday = cards.filter((card) => card.dueDate?.slice(0, 10) === todayDate).length;
  const upcoming = cards
    .filter((card) => card.dueDate && card.dueDate.slice(0, 10) >= todayDate)
    .sort((left, right) => (left.dueDate ?? "").localeCompare(right.dueDate ?? ""))
    .slice(0, 3);

  return (
    <section className="board-insights">
      <article className="insight-card">
        <span className="insight-label">Cards in play</span>
        <strong>{cards.length}</strong>
        <p>{lists.length} lists active across the board.</p>
      </article>
      <article className="insight-card">
        <span className="insight-label">Checklist progress</span>
        <strong>{completedItems}/{checklistItems.length || 0}</strong>
        <p>{checklistItems.length ? "Tasks are moving." : "Add checklist items to track delivery."}</p>
      </article>
      <article className="insight-card">
        <span className="insight-label">Due today</span>
        <strong>{dueToday}</strong>
        <p>{dueToday ? "Keep an eye on deadlines." : "No cards due today."}</p>
      </article>
      <article className="insight-card insight-card-wide">
        <span className="insight-label">Up next</span>
        {upcoming.length ? (
          <div className="upcoming-stack">
            {upcoming.map((card) => (
              <button key={card.id} className="upcoming-pill" onClick={() => onOpenCard(card.id)}>
                <strong>{card.title}</strong>
                <span>{card.dueDate ? new Date(card.dueDate).toLocaleDateString() : "No date"}</span>
              </button>
            ))}
          </div>
        ) : (
          <p>Set due dates on a few cards and they will surface here automatically.</p>
        )}
      </article>
    </section>
  );
}
