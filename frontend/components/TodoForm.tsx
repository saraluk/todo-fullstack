import { ChangeEvent, FormEvent, useCallback, useState } from "react";

import { Todo } from "@/types/todo";
import { createNewTodo } from "@/utils/todos";

interface TodoFormProps {
  onSuccess: (todo: Todo) => void;
}

export function TodoForm(props: TodoFormProps) {
  const { onSuccess } = props;

  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = useCallback(() => {}, []);

  const handleTitleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);
    },
    []
  );

  const handleAddTodo = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!title.trim()) return;

      setErrorMessage("");
      setIsLoading(true);
      try {
        const newTodo = await createNewTodo(title);
        if (newTodo) {
          onSuccess(newTodo);
          setTitle("");
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
    [onSuccess, title]
  );

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex">
          <input
            id="title"
            type="text"
            onChange={handleTitleChange}
            value={title}
            placeholder="What needs to be done?"
            className="w-full p-2 border-black border-1 rounded-md text-sm"
          />
          <button
            type="submit"
            disabled={!title.trim()}
            onClick={handleAddTodo}
            className="ml-2 px-4 py-2 bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 rounded-md text-white text-sm m"
          >
            {isLoading ? "Loading" : "Add"}
          </button>
        </div>
      </form>
      {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
    </div>
  );
}
