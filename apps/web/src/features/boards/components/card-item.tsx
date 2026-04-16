import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type CardItemProps = {
  id: string;
  listId: string;
  title: string;
  description?: string;
  labels?: { id: string; name: string; color: string }[];
  checklist?: { id: string; text: string; done: boolean }[];
  dueDate?: string;
  members?: { id: string; name: string; initials: string }[];
  onOpen: (cardId: string) => void;
};

export function CardItem({
  id,
  listId,
  title,
  description,
  labels,
  checklist,
  dueDate,
  members,
  onOpen
}: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: `card:${id}`,
    data: { type: "card", cardId: id, listId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const doneItems = checklist?.filter((item) => item.done).length ?? 0;
  const hasBadges = Boolean(description || checklist?.length || dueDate || members?.length);
  const coverClass = labels?.[0]?.color ?? "card-cover-default";

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(id)}
      className="group trello-card"
    >
      <div className={`card-cover ${coverClass}`} />
      {labels?.length ? (
        <div className="card-labels">
          {labels.slice(0, 4).map((label) => (
            <span key={label.id} className={`card-label ${label.color}`} title={label.name} />
          ))}
        </div>
      ) : null}
      <h3 className="text-sm font-medium leading-5">{title}</h3>
      {hasBadges ? (
        <div className="card-badges">
          {description ? <span title="Description">&#9776;</span> : null}
          {dueDate ? <span title="Due date">&#128337; {new Date(dueDate).toLocaleDateString()}</span> : null}
          {checklist?.length ? (
            <span title="Checklist">&#9745; {doneItems}/{checklist.length}</span>
          ) : null}
          {members?.length ? (
            <div className="card-members">
              {members.slice(0, 3).map((member) => (
                <span key={member.id} className="avatar avatar-sm" title={member.name}>
                  {member.initials}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <button 
        className="card-edit-button"
        title="Edit"
        onClick={(e) => {
          e.stopPropagation();
          onOpen(id);
        }}
      >
        <span className="text-[12px]">&#9998;</span>
      </button>
    </article>
  );
}
