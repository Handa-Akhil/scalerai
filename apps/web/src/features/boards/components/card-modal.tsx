"use client";

import { useMemo, useState } from "react";

type Label = { id: string; name: string; color: string };
type ChecklistItem = { id: string; text: string; done: boolean };
type Member = { id: string; name: string; initials: string };
type Comment = { id: string; authorId: string; authorName: string; text: string; createdAt: string };
type Activity = { id: string; text: string; createdAt: string };

type CardDetails = {
  id: string;
  title: string;
  description?: string;
  labels?: Label[];
  checklist?: ChecklistItem[];
  dueDate?: string;
  members?: Member[];
  comments?: Comment[];
  activity?: Activity[];
};

type CardModalProps = {
  card: CardDetails;
  availableMembers: Member[];
  onClose: () => void;
  onDelete: () => void;
  onSave: (next: CardDetails) => void;
};

const LABEL_COLORS = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-amber-500", "bg-purple-500"];

export function CardModal({ card, availableMembers, onClose, onDelete, onSave }: CardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [labels, setLabels] = useState<Label[]>(card.labels ?? []);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(card.checklist ?? []);
  const [dueDate, setDueDate] = useState(card.dueDate ?? "");
  const [members, setMembers] = useState<Member[]>(card.members ?? []);
  const [comments, setComments] = useState<Comment[]>(card.comments ?? []);
  const [activity, setActivity] = useState<Activity[]>(card.activity ?? []);
  const [labelInput, setLabelInput] = useState("");
  const [checklistInput, setChecklistInput] = useState("");
  const [commentInput, setCommentInput] = useState("");

  const completion = useMemo(() => {
    if (checklist.length === 0) {
      return "0/0";
    }
    const doneCount = checklist.filter((item) => item.done).length;
    return `${doneCount}/${checklist.length}`;
  }, [checklist]);

  function addLabel() {
    const value = labelInput.trim();
    if (!value) {
      return;
    }
    const color = LABEL_COLORS[labels.length % LABEL_COLORS.length] ?? "bg-slate-500";
    setLabels((prev) => [...prev, { id: crypto.randomUUID(), name: value, color }]);
    setLabelInput("");
  }

  function removeLabel(labelId: string) {
    setLabels((prev) => prev.filter((label) => label.id !== labelId));
  }

  function addChecklistItem() {
    const value = checklistInput.trim();
    if (!value) {
      return;
    }
    setChecklist((prev) => [...prev, { id: crypto.randomUUID(), text: value, done: false }]);
    setActivity((prev) => [
      { id: crypto.randomUUID(), text: `Added checklist item "${value}"`, createdAt: new Date().toISOString() },
      ...prev
    ]);
    setChecklistInput("");
  }

  function toggleChecklistItem(itemId: string) {
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item))
    );
  }

  function removeChecklistItem(itemId: string) {
    setChecklist((prev) => prev.filter((item) => item.id !== itemId));
  }

  function toggleMember(member: Member) {
    setMembers((prev) => {
      const exists = prev.some((item) => item.id === member.id);
      if (exists) {
        return prev.filter((item) => item.id !== member.id);
      }
      return [...prev, member];
    });
  }

  function handleSave() {
    onSave({
      id: card.id,
      title: title.trim() || "Untitled Card",
      description: description.trim(),
      labels,
      checklist,
      dueDate,
      members,
      comments,
      activity
    });
  }

  function addComment() {
    const value = commentInput.trim();
    if (!value) return;
    const now = new Date().toISOString();
    setComments((prev) => [
      { id: crypto.randomUUID(), authorId: "local-user", authorName: "You", text: value, createdAt: now },
      ...prev
    ]);
    setActivity((prev) => [
      { id: crypto.randomUUID(), text: "Added a comment", createdAt: now },
      ...prev
    ]);
    setCommentInput("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-lg font-semibold outline-none focus:border-slate-400"
          />
          <button className="ml-3 text-sm text-slate-500 hover:text-slate-700" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Description</h3>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add card details..."
              className="h-28 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-slate-400"
            />
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Due Date</h3>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Labels</h3>
            <div className="mb-2 flex gap-2">
              <input
                value={labelInput}
                onChange={(event) => setLabelInput(event.target.value)}
                placeholder="Add label"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
              <button onClick={addLabel} className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => removeLabel(label.id)}
                  className={`rounded-full px-3 py-1 text-xs text-white ${label.color}`}
                >
                  {label.name} x
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Assignees</h3>
            <div className="flex flex-wrap gap-2">
              {availableMembers.map((member) => {
                const active = members.some((item) => item.id === member.id);
                return (
                  <button
                    key={member.id}
                    onClick={() => toggleMember(member)}
                    className={`rounded-lg border px-3 py-1 text-xs ${
                      active
                        ? "border-slate-800 bg-slate-800 text-white"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    {member.initials}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <section className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Checklist</h3>
            <span className="text-xs text-slate-500">{completion}</span>
          </div>
          <div className="mb-2 flex gap-2">
            <input
              value={checklistInput}
              onChange={(event) => setChecklistInput(event.target.value)}
              placeholder="Add checklist item"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
            <button
              onClick={addChecklistItem}
              className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white"
            >
              Add
            </button>
          </div>
          <div className="space-y-2">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleChecklistItem(item.id)}
                  />
                  <span className={item.done ? "line-through text-slate-400" : ""}>{item.text}</span>
                </label>
                <button onClick={() => removeChecklistItem(item.id)} className="text-xs text-red-500">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Comments</h3>
          <div className="mb-2 flex gap-2">
            <input
              value={commentInput}
              onChange={(event) => setCommentInput(event.target.value)}
              placeholder="Write a comment..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
            <button onClick={addComment} className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white">
              Add
            </button>
          </div>
          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-slate-200 p-2 text-sm text-slate-700">
                <strong>{comment.authorName}</strong>
                <p className="mb-1 mt-1">{comment.text}</p>
                <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Activity</h3>
          <div className="space-y-2">
            {activity.map((item) => (
              <p key={item.id} className="text-xs text-slate-500">
                {item.text} - {new Date(item.createdAt).toLocaleString()}
              </p>
            ))}
          </div>
        </section>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => {
              if (window.confirm(`Delete "${title || card.title}"?`)) {
                onDelete();
              }
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-red-500"
          >
            Delete
          </button>
          <button onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
            Cancel
          </button>
          <button onClick={handleSave} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
