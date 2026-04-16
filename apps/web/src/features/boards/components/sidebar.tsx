type SidebarProps = {
  collapsed: boolean;
  boardTitle: string;
  onToggle: () => void;
  onCreateBoard: () => void;
  onOpenMembers: () => void;
  onOpenSettings: () => void;
};

export function Sidebar({
  collapsed,
  boardTitle,
  onToggle,
  onCreateBoard,
  onOpenMembers,
  onOpenSettings
}: SidebarProps) {
  return (
    <aside className={collapsed ? "workspace-sidebar collapsed" : "workspace-sidebar"}>
      <div className="workspace-switcher">
        <div className="workspace-avatar">
          P
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm">Projects Workspace</span>
          <span className="text-xs text-white/80">Free</span>
        </div>
        <button className="sidebar-collapse" aria-label="Toggle sidebar" onClick={onToggle}>
          <span className="text-sm">{collapsed ? ">" : "<"}</span>
        </button>
      </div>

      <div className="sidebar-nav">
        <button className="sidebar-link active" onClick={onToggle}>
          <span className="sidebar-link-text">
            <span className="text-white/70">&#9862;</span> Boards
          </span>
        </button>
        <button className="sidebar-link" onClick={onOpenMembers}>
          <span className="sidebar-link-text">
            <span className="text-white/70">&#128101;</span> Assignees
          </span>
          <span className="sidebar-plus">+</span>
        </button>
        <button className="sidebar-link" onClick={onOpenSettings}>
          <span className="sidebar-link-text">
            <span className="text-white/70">&#9881;</span> Workspace settings
          </span>
          <span className="sidebar-plus">&#709;</span>
        </button>

        <div className="sidebar-section-heading">
          <span className="text-xs font-semibold text-white/80">Your boards</span>
          <button className="sidebar-plus-button" onClick={onCreateBoard}>+</button>
        </div>
        
        <button className="sidebar-board active">
          <span className="sidebar-link-text">
             <span className="board-tile" />
             {boardTitle}
          </span>
        </button>
      </div>
    </aside>
  );
}
