export const boardPreview = {
  title: "Product Planning Board",
  lists: [
    {
      id: "todo",
      title: "To Do",
      cards: [
        { id: "todo-1", title: "Design login page", description: "Simple and clean UI" },
        { id: "todo-2", title: "Set up API auth routes", description: "JWT + middleware" }
      ]
    },
    {
      id: "doing",
      title: "Doing",
      cards: [
        { id: "doing-1", title: "Implement boards CRUD", description: "MVC services ready" },
        { id: "doing-2", title: "Add card move endpoint", description: "Position-based ordering" }
      ]
    },
    {
      id: "done",
      title: "Done",
      cards: [
        { id: "done-1", title: "Project architecture setup" },
        { id: "done-2", title: "Base API error handling" }
      ]
    }
  ]
};
