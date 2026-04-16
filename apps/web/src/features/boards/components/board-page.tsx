"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";

import { createCard, deleteCard, moveCard, updateCard } from "@/features/cards/api";
import { createList, deleteList, updateListPosition, updateListTitle } from "@/features/lists/api";
import { createBoard } from "../api";
import { useBoardData } from "../hooks/use-board-data";
import type { BoardColumn } from "../types";
import { BoardInsights } from "./board-insights";
import { BoardView } from "./board-view";
import { CalendarView } from "./calendar-view";
import { CardModal } from "./card-modal";
import { Sidebar } from "./sidebar";

const POSITION_GAP = 1024;

type BackgroundMode = "minimal" | "glass";
type ToneMode = "light" | "dark";
type ViewMode = "board" | "calendar";
type Panel = "workspaces" | "recent" | "starred" | "templates" | "create" | "assignees" | "settings" | "menu" | "notifications" | "help";

export function BoardPage() {
  const { boardId, boardTitle, columns, members, loading, error } = useBoardData();
  const [boardColumns, setBoardColumns] = useState<BoardColumn[]>([]);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("all");
  const [selectedMember, setSelectedMember] = useState("all");
  const [newBoardName, setNewBoardName] = useState("Project Roadmap");
  const [panelBoardName, setPanelBoardName] = useState("Launch Checklist");
  const [dueFilter, setDueFilter] = useState<"all" | "overdue" | "today" | "upcoming" | "none">("all");
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("minimal");
  const [toneMode, setToneMode] = useState<ToneMode>("light");
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel | null>(null);
  const [assigneeQuery, setAssigneeQuery] = useState("");
  useEffect(() => {
    setBoardColumns(columns);
  }, [columns]);

  async function handleAddList(title: string) {
    if (!boardId) return;
    const position = boardColumns.length > 0 ? boardColumns[boardColumns.length - 1].position + POSITION_GAP : POSITION_GAP;
    const tempId = `temp-list-${Date.now()}`;
    const newList: BoardColumn = { id: tempId, title, position, cards: [] };

    setBoardColumns([...boardColumns, newList]);

    try {
      const serverList = await createList(boardId, title, position);
      setBoardColumns((prev) => prev.map((list) => (list.id === tempId ? { ...serverList, cards: [] } : list)));
    } catch {
      setBoardColumns((prev) => prev.filter((list) => list.id !== tempId));
    }
  }

  async function handleQuickCreateList() {
    await handleAddList("New list");
    setActivePanel(null);
  }

  async function handleAddCard(listId: string, title: string) {
    setBoardColumns((prev) => {
      const next = prev.map((list) => ({ ...list, cards: [...list.cards] }));
      const list = next.find((item) => item.id === listId);
      if (!list) return next;

      const position = list.cards.length > 0 ? list.cards[list.cards.length - 1].position + POSITION_GAP : POSITION_GAP;
      const tempCardId = `temp-card-${Date.now()}`;
      list.cards.push({ id: tempCardId, listId, title, position });

      createCard(listId, title, position)
        .then((serverCard) => {
          setBoardColumns((current) => current.map((item) => item.id === listId ? { ...item, cards: item.cards.map((card) => card.id === tempCardId ? serverCard as BoardColumn["cards"][0] : card) } : item));
        })
        .catch(() => setBoardColumns(prev));

      return next;
    });
  }

  async function handleRenameList(listId: string, title: string) {
    const previous = boardColumns;
    setBoardColumns((prev) => prev.map((list) => (list.id === listId ? { ...list, title } : list)));
    try {
      await updateListTitle(listId, title);
    } catch {
      setBoardColumns(previous);
    }
  }

  async function handleDeleteList(listId: string): Promise<void> {
    const previous = boardColumns;
    setBoardColumns((prev) => prev.filter((list) => list.id !== listId));

    try {
      await deleteList(listId);
    } catch {
      setBoardColumns(previous);
    }
  }

  async function handleDeleteCard(cardId: string): Promise<void> {
    const previous = boardColumns;
    setBoardColumns((prev) =>
      prev.map((list) => ({
        ...list,
        cards: list.cards.filter((card) => card.id !== cardId)
      }))
    );

    try {
      await deleteCard(cardId);
      setActiveCardId(null);
    } catch {
      setBoardColumns(previous);
    }
  }

  async function handleDragEnd(event: DragEndEvent): Promise<void> {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith("list:") && overId.startsWith("list:")) {
      await reorderLists(activeId.replace("list:", ""), overId.replace("list:", ""));
      return;
    }

    if (activeId.startsWith("card:")) {
      await moveCardBetweenLists(activeId.replace("card:", ""), overId);
    }
  }

  async function reorderLists(activeListId: string, overListId: string): Promise<void> {
    const previous = boardColumns;
    const oldIndex = boardColumns.findIndex((list) => list.id === activeListId);
    const newIndex = boardColumns.findIndex((list) => list.id === overListId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const reordered = arrayMove(boardColumns, oldIndex, newIndex).map((list, index) => ({ ...list, position: (index + 1) * POSITION_GAP }));
    setBoardColumns(reordered);

    try {
      await Promise.all(reordered.map((list) => updateListPosition(list.id, list.position)));
    } catch {
      setBoardColumns(previous);
    }
  }

  async function moveCardBetweenLists(activeCardId: string, overId: string): Promise<void> {
    const previous = boardColumns;
    const next = boardColumns.map((list) => ({ ...list, cards: list.cards.map((card) => ({ ...card })) }));
    const sourceList = next.find((list) => list.cards.some((card) => card.id === activeCardId));
    if (!sourceList) return;

    const sourceIndex = sourceList.cards.findIndex((card) => card.id === activeCardId);
    const [movedCard] = sourceList.cards.splice(sourceIndex, 1);
    if (!movedCard) return;

    const targetListId = overId.startsWith("card:") ? findListIdByCardId(next, overId.replace("card:", "")) : overId.startsWith("list:") ? overId.replace("list:", "") : null;
    if (!targetListId) return;

    const targetList = next.find((list) => list.id === targetListId);
    if (!targetList) return;

    const targetIndex = overId.startsWith("card:") ? targetList.cards.findIndex((card) => card.id === overId.replace("card:", "")) : targetList.cards.length;
    movedCard.listId = targetList.id;
    targetList.cards.splice(targetIndex >= 0 ? targetIndex : targetList.cards.length, 0, movedCard);

    targetList.cards = targetList.cards.map((card, index) => ({ ...card, listId: targetList.id, position: (index + 1) * POSITION_GAP }));
    if (sourceList.id !== targetList.id) {
      sourceList.cards = sourceList.cards.map((card, index) => ({ ...card, listId: sourceList.id, position: (index + 1) * POSITION_GAP }));
    }

    setBoardColumns(next);

    const beforeCardId = targetList.cards[targetIndex + 1]?.id;
    const afterCardId = targetList.cards[targetIndex - 1]?.id;

    try {
      await moveCard(activeCardId, { targetListId: targetList.id, beforeCardId, afterCardId });
    } catch {
      setBoardColumns(previous);
    }
  }

  function findListIdByCardId(lists: BoardColumn[], cardId: string): string | null {
    for (const list of lists) {
      if (list.cards.some((card) => card.id === cardId)) return list.id;
    }
    return null;
  }

  function findCardById(cardId: string) {
    for (const list of boardColumns) {
      const card = list.cards.find((item) => item.id === cardId);
      if (card) return card;
    }
    return null;
  }

  function updateCardDetails(cardId: string, updates: Partial<BoardColumn["cards"][number]>): void {
    setBoardColumns((prev) => prev.map((list) => ({ ...list, cards: list.cards.map((card) => card.id === cardId ? { ...card, ...updates } : card) })));
  }

  function clearFilters() {
    setSearchTerm("");
    setSelectedLabel("all");
    setSelectedMember("all");
    setDueFilter("all");
  }

  const labelOptions = useMemo(() => {
    const map = new Map<string, string>();
    boardColumns.forEach((list) => list.cards.forEach((card) => card.labels?.forEach((label) => map.set(label.id, label.name))));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [boardColumns]);

  const memberOptions = useMemo(() => {
    const map = new Map<string, string>();
    boardColumns.forEach((list) => list.cards.forEach((card) => card.members?.forEach((member) => map.set(member.id, member.name))));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [boardColumns]);

  const hasActiveFilters = searchTerm.trim().length > 0 || selectedLabel !== "all" || selectedMember !== "all" || dueFilter !== "all";

  const filteredColumns = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const todayDate = new Date().toISOString().slice(0, 10);

    return boardColumns.map((list) => ({
      ...list,
      cards: list.cards.filter((card) => {
        const matchesTitle = query.length === 0 || card.title.toLowerCase().includes(query);
        const matchesLabel = selectedLabel === "all" || card.labels?.some((label) => label.id === selectedLabel);
        const matchesMember = selectedMember === "all" || card.members?.some((member) => member.id === selectedMember);
        const cardDate = card.dueDate?.slice(0, 10);
        let matchesDueDate = true;
        if (dueFilter === "none") matchesDueDate = !cardDate;
        if (dueFilter === "today") matchesDueDate = cardDate === todayDate;
        if (dueFilter === "overdue") matchesDueDate = Boolean(cardDate && cardDate < todayDate);
        if (dueFilter === "upcoming") matchesDueDate = Boolean(cardDate && cardDate > todayDate);
        return matchesTitle && matchesLabel && matchesMember && matchesDueDate;
      })
    }));
  }, [boardColumns, dueFilter, searchTerm, selectedLabel, selectedMember]);

  const activityFeed = useMemo(() => {
    return boardColumns
      .flatMap((list) =>
        list.cards.flatMap((card) => [
          ...(card.activity ?? []).map((item) => ({
            id: item.id,
            title: item.text,
            meta: `${card.title} in ${list.title}`,
            createdAt: item.createdAt
          })),
          ...(card.comments ?? []).map((comment) => ({
            id: comment.id,
            title: `${comment.authorName} commented`,
            meta: `${card.title}: ${comment.text}`,
            createdAt: comment.createdAt
          }))
        ])
      )
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 6);
  }, [boardColumns]);

  if (loading) return <div className="loading-state">Loading board...</div>;
  if (error) return <div className="loading-state">Error: {error}</div>;

  if (!boardId) {
    return (
      <div className="auth-screen">
        <form
          className="auth-panel"
          onSubmit={async (event) => {
            event.preventDefault();
            await createBoard(newBoardName);
            window.location.reload();
          }}
        >
          <p className="eyebrow">New workspace</p>
          <h1>Create your first board</h1>
          <label>
            Board name
            <input value={newBoardName} onChange={(event) => setNewBoardName(event.target.value)} />
          </label>
          <button className="primary-button" type="submit">Create board</button>
        </form>
      </div>
    );
  }

  const activeCard = activeCardId ? findCardById(activeCardId) : null;

  return (
    <div className={`app-shell bg-board board-surface-${backgroundMode} board-tone-${toneMode}`}>
      <header className="global-header">
        <div className="flex items-center gap-1">
          <button className="icon-button" aria-label="Toggle sidebar" onClick={() => setSidebarCollapsed((value) => !value)}>
            <span className="waffle-icon">...</span>
          </button>
          <button className="brand-button" aria-label="Home" onClick={() => setViewMode("board")}>
            <span className="brand-mark"><span /><span /></span> Trello
          </button>
          <div className="top-nav">
            <button className="nav-button" onClick={() => setActivePanel(activePanel === "workspaces" ? null : "workspaces")}>Workspaces <span className="text-[10px]">&#9660;</span></button>
            <button className="nav-button" onClick={() => setActivePanel(activePanel === "recent" ? null : "recent")}>Recent <span className="text-[10px]">&#9660;</span></button>
            <button className="nav-button" onClick={() => setActivePanel(activePanel === "starred" ? null : "starred")}>Starred <span className="text-[10px]">&#9660;</span></button>
            <button className="nav-button" onClick={() => setActivePanel(activePanel === "templates" ? null : "templates")}>Templates <span className="text-[10px]">&#9660;</span></button>
            <button className="create-button" onClick={() => setActivePanel(activePanel === "create" ? null : "create")}>Create</button>
          </div>
        </div>

        <div className="header-actions">
          <div className="search-wrap">
            <span className="search-icon">&#128269;</span>
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search" className="search-input" />
          </div>
          <button className="icon-button" aria-label="Notifications" onClick={() => setActivePanel(activePanel === "notifications" ? null : "notifications")}>&#128276;</button>
          <button className="icon-button" aria-label="Help" onClick={() => setActivePanel(activePanel === "help" ? null : "help")}>?</button>
          <span className="avatar" aria-label="Workspace member">PM</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden w-full relative">
        <Sidebar
          collapsed={sidebarCollapsed}
          boardTitle={boardTitle}
          onToggle={() => setSidebarCollapsed((value) => !value)}
          onCreateBoard={() => setActivePanel("create")}
          onOpenMembers={() => setActivePanel("assignees")}
          onOpenSettings={() => setActivePanel("settings")}
        />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="board-header">
            <div className="board-title-group">
              <h1 className="board-title">{boardTitle}</h1>
              <button className="icon-button" title="Star Board" onClick={() => setActivePanel("starred")}>&#9734;</button>
              <div className="divider" />
              <button className="board-action" onClick={() => setActivePanel("assignees")}><span className="text-base leading-none mb-1">&#128101;</span> Project board</button>
              <div className="divider" />
              <button className={viewMode === "board" ? "board-action selected" : "board-action"} onClick={() => setViewMode("board")}>Board</button>
              <button className={viewMode === "calendar" ? "board-action selected" : "board-action"} onClick={() => setViewMode("calendar")}>Calendar</button>
            </div>

            <div className="board-tools">
              <button className="icon-button" title="Settings" onClick={() => setActivePanel("settings")}>&#9881;</button>
              <div className="divider" />
              <select value={selectedLabel} onChange={(event) => setSelectedLabel(event.target.value)} className="filter-select">
                <option value="all" className="text-slate-800">All labels</option>
                {labelOptions.map((label) => <option key={label.id} value={label.id} className="text-slate-800">{label.name}</option>)}
              </select>
              <select value={selectedMember} onChange={(event) => setSelectedMember(event.target.value)} className="filter-select">
                <option value="all" className="text-slate-800">All assignees</option>
                {memberOptions.map((member) => <option key={member.id} value={member.id} className="text-slate-800">{member.name}</option>)}
              </select>
              <select value={dueFilter} onChange={(event) => setDueFilter(event.target.value as typeof dueFilter)} className="filter-select">
                <option value="all" className="text-slate-800">All dates</option>
                <option value="overdue" className="text-slate-800">Overdue</option>
                <option value="today" className="text-slate-800">Due today</option>
                <option value="upcoming" className="text-slate-800">Upcoming</option>
                <option value="none" className="text-slate-800">No date</option>
              </select>
              <select value={backgroundMode} onChange={(event) => setBackgroundMode(event.target.value as BackgroundMode)} className="filter-select">
                <option value="minimal" className="text-slate-800">Minimal mode</option>
                <option value="glass" className="text-slate-800">Glass mode</option>
              </select>
              <select value={toneMode} onChange={(event) => setToneMode(event.target.value as ToneMode)} className="filter-select">
                <option value="light" className="text-slate-800">Light tone</option>
                <option value="dark" className="text-slate-800">Dark tone</option>
              </select>
              {hasActiveFilters ? <button className="show-menu-button" onClick={clearFilters}>Clear filters</button> : null}
              <button className="show-menu-button" onClick={() => setActivePanel(activePanel === "menu" ? null : "menu")}><span>&#8942;</span> Show menu</button>
            </div>
          </div>

          <BoardInsights lists={boardColumns} onOpenCard={setActiveCardId} />

          {viewMode === "board" ? (
            <BoardView
              lists={filteredColumns}
              onDragEnd={hasActiveFilters ? () => undefined : handleDragEnd}
              onOpenCard={setActiveCardId}
              onAddList={handleAddList}
              onAddCard={handleAddCard}
              onRenameList={handleRenameList}
              onDeleteList={handleDeleteList}
            />
          ) : (
            <CalendarView lists={filteredColumns} onOpenCard={setActiveCardId} />
          )}

          {activeCard ? (
            <CardModal
              card={activeCard}
              availableMembers={members.map((member) => ({
                id: member.id,
                name: member.name,
                initials: member.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              }))}
              onClose={() => setActiveCardId(null)}
              onDelete={() => void handleDeleteCard(activeCard.id)}
              onSave={(next) => {
                updateCardDetails(activeCard.id, {
                  title: next.title,
                  description: next.description,
                  labels: next.labels,
                  checklist: next.checklist,
                  dueDate: next.dueDate,
                  members: next.members,
                  comments: next.comments,
                  activity: next.activity
                });
                void updateCard(activeCard.id, next).catch(() => undefined);
                setActiveCardId(null);
              }}
            />
          ) : null}

          {activePanel ? (
            <div className="floating-panel">
              <div className="panel-header">
                <strong>{panelTitle(activePanel)}</strong>
                <button className="close-button" onClick={() => setActivePanel(null)}>&times;</button>
              </div>
              <PanelContent
                panel={activePanel}
                boardTitle={boardTitle}
                panelBoardName={panelBoardName}
                setPanelBoardName={setPanelBoardName}
                backgroundMode={backgroundMode}
                toneMode={toneMode}
                setBackgroundMode={setBackgroundMode}
                setToneMode={setToneMode}
                setViewMode={setViewMode}
                clearFilters={clearFilters}
                createList={handleQuickCreateList}
                createBoard={async () => {
                  await createBoard(panelBoardName);
                  window.location.reload();
                }}
                assigneeQuery={assigneeQuery}
                setAssigneeQuery={setAssigneeQuery}
                assignees={members}
                activityFeed={activityFeed}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function panelTitle(panel: Panel) {
  const titles: Record<Panel, string> = {
    workspaces: "Workspace",
    recent: "Recent",
    starred: "Starred",
    templates: "Templates",
    create: "Create",
    assignees: "Assignees",
    settings: "Settings",
    menu: "Board menu",
    notifications: "Notifications",
    help: "Help"
  };
  return titles[panel];
}

type PanelContentProps = {
  panel: Panel;
  boardTitle: string;
  panelBoardName: string;
  setPanelBoardName: (value: string) => void;
  backgroundMode: BackgroundMode;
  toneMode: ToneMode;
  setBackgroundMode: (mode: BackgroundMode) => void;
  setToneMode: (mode: ToneMode) => void;
  setViewMode: (mode: ViewMode) => void;
  clearFilters: () => void;
  createList: () => void;
  createBoard: () => Promise<void>;
  assigneeQuery: string;
  setAssigneeQuery: (value: string) => void;
  assignees: Array<{ id: string; name: string; email: string }>;
  activityFeed: Array<{ id: string; title: string; meta: string; createdAt: string }>;
};

function PanelContent({
  panel,
  boardTitle,
  panelBoardName,
  setPanelBoardName,
  backgroundMode,
  toneMode,
  setBackgroundMode,
  setToneMode,
  setViewMode,
  clearFilters,
  createList,
  createBoard,
  assigneeQuery,
  setAssigneeQuery,
  assignees,
  activityFeed
}: PanelContentProps) {
  if (panel === "create") {
    return (
      <div className="panel-stack">
        <div className="todo-preview-visual">
          <div className="todo-preview-column">
            <span />
            <span />
            <span />
          </div>
          <div className="todo-preview-column">
            <span />
            <span />
          </div>
          <div className="todo-preview-column">
            <span />
            <span />
            <span />
          </div>
        </div>
        <label className="panel-field">
          Board title
          <input value={panelBoardName} onChange={(event) => setPanelBoardName(event.target.value)} className="panel-input" />
        </label>
        <button className="panel-action panel-action-primary" onClick={() => void createBoard()}>Create board</button>
        <button className="panel-action" onClick={createList}>Create a list</button>
        <button className="panel-action" onClick={() => setViewMode("calendar")}>Open calendar</button>
      </div>
    );
  }

  if (panel === "settings" || panel === "menu") {
    return (
      <div className="panel-stack">
        <p>Switch between a classic Trello-like board surface and a softer glass treatment.</p>
        <select value={backgroundMode} onChange={(event) => setBackgroundMode(event.target.value as BackgroundMode)} className="panel-select">
          <option value="minimal">Minimal background</option>
          <option value="glass">Glass background</option>
        </select>
        <select value={toneMode} onChange={(event) => setToneMode(event.target.value as ToneMode)} className="panel-select">
          <option value="light">Light tone</option>
          <option value="dark">Dark tone</option>
        </select>
        <button className="panel-action" onClick={clearFilters}>Clear filters</button>
      </div>
    );
  }

  if (panel === "assignees") {
    const visibleAssignees = assignees.filter((assignee) => assignee.name.toLowerCase().includes(assigneeQuery.toLowerCase()));
    return (
      <div className="panel-stack">
        <label className="panel-field">
          Filter assignees
          <input value={assigneeQuery} onChange={(event) => setAssigneeQuery(event.target.value)} className="panel-input" placeholder="Search by name" />
        </label>
        <div className="panel-list">
          {visibleAssignees.map((assignee) => (
            <div key={assignee.id} className="panel-list-item">
              <div className="panel-avatar">{assignee.name.slice(0, 2).toUpperCase()}</div>
              <div>
                <strong>{assignee.name}</strong>
                <span>{assignee.email}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (panel === "notifications") {
    return (
      <div className="panel-stack">
        <p>Recent board activity, comments, and checklist updates appear here.</p>
        <div className="panel-list">
          {activityFeed.length ? activityFeed.map((item) => (
            <div key={item.id} className="panel-list-item panel-list-item-activity">
              <div className="panel-avatar panel-avatar-accent">&#9719;</div>
              <div>
                <strong>{item.title}</strong>
                <span>{item.meta}</span>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </div>
            </div>
          )) : <p>No activity yet. Create cards, comments, or checklist items to populate the feed.</p>}
        </div>
      </div>
    );
  }

  if (panel === "help") {
    return (
      <div className="panel-stack">
        <div className="panel-list-item panel-list-item-activity">
          <div className="panel-avatar panel-avatar-accent">1</div>
          <div>
            <strong>Open cards for full detail</strong>
            <span>Descriptions, labels, due dates, comments, and assignees all live in the card sheet.</span>
          </div>
        </div>
        <div className="panel-list-item panel-list-item-activity">
          <div className="panel-avatar panel-avatar-accent">2</div>
          <div>
            <strong>Use filters to focus</strong>
            <span>Filter by labels, assignees, and dates to narrow down what matters right now.</span>
          </div>
        </div>
        <div className="panel-list-item panel-list-item-activity">
          <div className="panel-avatar panel-avatar-accent">3</div>
          <div>
            <strong>Switch to calendar for deadlines</strong>
            <span>Cards with due dates animate into the calendar so deadlines stay visible.</span>
          </div>
        </div>
      </div>
    );
  }
  if (panel === "starred") return <p>{boardTitle} is marked as your active board for this workspace.</p>;
  if (panel === "templates") return <p>Use this board as a reusable project template by duplicating it after you finish the layout.</p>;
  if (panel === "recent") return <p>{boardTitle} is your latest active board. Upcoming card deadlines appear in the insights strip.</p>;
  if (panel === "workspaces") return <p>This assignment uses one focused workspace experience, with board creation and planning actions available from Create.</p>;

  return <p>{boardTitle} is ready. Use Create to add lists, or switch to Calendar for scheduled work.</p>;
}
