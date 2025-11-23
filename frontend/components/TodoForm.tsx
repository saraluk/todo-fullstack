import { ChangeEvent, FormEvent, useCallback, useState } from "react";

import { Todo } from "@/types/todo";
import { createNewTodo } from "@/utils/todos";
import { useAuth } from "@/contexts/AuthContext";

interface TodoFormProps {
  onSuccess: (todo: Todo) => void;
}

export function TodoForm(props: TodoFormProps) {
  const { onSuccess } = props;
  const { isAuthenticated, token } = useAuth();

  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = useCallback(() => {}, []);

  const handleTitleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);
    },
    []
  );

  const handleDueDateChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setDueDate(event.target.value);
    },
    []
  );

  const handleAddTodo = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!isAuthenticated || !token) {
        setIsLoading(false);
        setErrorMessage(
          "You are not authenticated. Please login to add a todo."
        );
        return;
      }

      if (!title.trim()) return;

      // Validate due date is in the future
      if (dueDate) {
        const selectedDate = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          setErrorMessage("Due date must be in the future");
          return;
        }
      }

      setErrorMessage("");
      setIsLoading(true);
      try {
        const newTodo = await createNewTodo(token, {
          title,
          dueDate: dueDate || null,
        });
        if (newTodo) {
          onSuccess(newTodo);
          setTitle("");
          setDueDate("");
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(String(error));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [dueDate, isAuthenticated, onSuccess, title, token]
  );

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              onChange={handleTitleChange}
              value={title}
              placeholder="What needs to be done?"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Due date (optional)
            </label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={handleDueDateChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={!title.trim()}
            onClick={handleAddTodo}
            className="mt-2 md:mt-6 px-4 py-2 bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 rounded-md text-white text-sm"
          >
            {isLoading ? "Loading" : "Add"}
          </button>
        </div>
      </form>
      {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
    </div>
  );
}
