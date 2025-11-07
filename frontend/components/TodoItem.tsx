import { Todo } from "@/types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

export function TodoItem(props: TodoItemProps) {
  const { todo, onToggleComplete, onDelete } = props;

  return (
    <li className="flex justify-between items-center py-2 border-b">
      <div>
        <input
          id={todo.id.toString()}
          type="checkbox"
          checked={todo.isComplete ?? false}
          onChange={() => onToggleComplete(todo)}
        />
        <label
          htmlFor={todo.id.toString()}
          className={`ml-2 text-[16px] select-none text-lg ${
            todo.isComplete ? "line-through text-gray-500" : "text-gray-800"
          }`}
        >
          {todo.title}
        </label>
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
