"use client";

import type { BoardColumn } from "../types";

type CalendarViewProps = {
  lists: BoardColumn[];
  onOpenCard: (cardId: string) => void;
};

function monthDays(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function CalendarView({ lists, onOpenCard }: CalendarViewProps) {
  const today = new Date();
  const days = monthDays(today);
  const monthName = today.toLocaleString(undefined, { month: "long", year: "numeric" });
  const events = lists.flatMap((list) =>
    list.cards
      .filter((card) => card.dueDate)
      .map((card) => ({
        ...card,
        listTitle: list.title,
        dateKey: card.dueDate?.slice(0, 10)
      }))
  );

  const nextEvent = events
    .slice()
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
    .find((event) => event.dateKey && event.dateKey >= today.toISOString().slice(0, 10));

  return (
    <main className="calendar-shell">
      <div className="calendar-header">
        <div>
          <p className="eyebrow">Calendar</p>
          <h2>{monthName}</h2>
        </div>
        <span>{events.length} scheduled {events.length === 1 ? "event" : "events"}</span>
      </div>

      <div className="calendar-highlight">
        <div>
          <p className="calendar-highlight-label">Next focus</p>
          <strong>{nextEvent?.title ?? "No upcoming due dates"}</strong>
        </div>
        <span>{nextEvent?.listTitle ?? "Add dates to cards to populate the calendar"}</span>
      </div>

      <div className="calendar-weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((day) => {
          const dateKey = day.toISOString().slice(0, 10);
          const dayEvents = events.filter((event) => event.dateKey === dateKey);
          const muted = day.getMonth() !== today.getMonth();
          const isToday = dateKey === today.toISOString().slice(0, 10);

          return (
            <section key={dateKey} className={muted ? "calendar-day muted" : "calendar-day"}>
              <div className="calendar-date-row">
                <span className={isToday ? "calendar-date today" : "calendar-date"}>{day.getDate()}</span>
              </div>
              <div className="calendar-events">
                {dayEvents.map((event) => (
                  <button key={event.id} className={isToday ? "calendar-event calendar-event-live" : "calendar-event"} onClick={() => onOpenCard(event.id)}>
                    <strong>{event.title}</strong>
                    <span>{event.listTitle}</span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
