import { Todo } from "@/types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

export function TodoItem(props: TodoItemProps) {
  const { todo, onToggleComplete, onDelete } = props;

  const formattedDueDate =
    todo.dueDate && !isNaN(Date.parse(todo.dueDate))
      ? new Date(todo.dueDate).toLocaleDateString()
      : null;

  return (
    <li className="flex justify-between items-center py-3 border-b gap-4">
      <div className="flex items-start gap-2">
        <input
          id={todo.id.toString()}
          type="checkbox"
          checked={todo.isComplete ?? false}
          onChange={() => onToggleComplete(todo)}
          className="mt-1"
        />
        <div>
          <label
            htmlFor={todo.id.toString()}
            className={`block text-[16px] select-none text-lg ${
              todo.isComplete ? "line-through text-gray-500" : "text-gray-800"
            }`}
          >
            {todo.title}
          </label>
          {formattedDueDate && !todo.isComplete && (
            <p className="text-xs text-gray-500">Due {formattedDueDate}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        className="text-sm text-red-500 hover:text-red-700 py-[4px]"
      >
        Delete
      </button>
    </li>
  );
}
