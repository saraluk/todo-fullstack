"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { Todo } from "@/types/todo";
import { deleteTodo, updateTodo } from "@/utils/todos";
import { TodoForm } from "./TodoForm";

interface TodoListProps {
  initialTodos: Todo[];
}
export function TodoList(props: TodoListProps) {
  const { initialTodos } = props;
  const initialTodoMap = useMemo(() => {
    return new Map(initialTodos.map((todo) => [todo.id, todo]));
  }, [initialTodos]);

  const [todosMap, setTodosMap] = useState<Map<number, Todo>>(initialTodoMap);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  const handleAddTodoSuccess = useCallback((todo: Todo) => {
    setTodosMap((prevTodosMap) => {
      const newTodosMap = new Map(prevTodosMap);
      newTodosMap.set(todo.id, todo);
      return newTodosMap;
    });
  }, []);

  const handleToggleComplete = useCallback(async (todo: Todo) => {
    const updatedTodo = {
      ...todo,
      isComplete: !todo.isComplete,
    };

    setErrorMessage("");
    // Optimistically update the UI state before the API call
    setTodosMap((prevTodosMap) => {
      const newTodosMap = new Map(prevTodosMap);
      newTodosMap.set(todo.id, updatedTodo);
      return newTodosMap;
    });

    try {
      await updateTodo(updatedTodo);
    } catch (error) {
      // Revert the state on failure
      setTodosMap((prevTodosMap) => {
        const newTodosMap = new Map(prevTodosMap);
        newTodosMap.set(todo.id, todo);
        return newTodosMap;
      });

      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }
  }, []);

  const handleDeleteTodo = useCallback(
    async (id: number) => {
      // Optimistically update the UI state
      setTodosMap((prevTodos) => {
        const newMap = new Map(prevTodos);
        newMap.delete(id);
        return newMap;
      });
      try {
        await deleteTodo(id);
      } catch (error) {
        router.refresh();
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
      }
    },
    [router]
  );

  return (
    <>
      <TodoForm onSuccess={handleAddTodoSuccess} />
      {todosMap.size === 0 ? (
        <p className="mt-4 text-sm text-gray">No tasks yet! Add one above.</p>
      ) : (
        <ul>
          {errorMessage && <p className="color-red">{errorMessage}</p>}
          {Array.from(todosMap.values()).map((todo) => (
            <li
              key={todo.id}
              className="flex justify-between items-center py-2 border-b"
            >
              <div>
                <input
                  id={todo.id.toString()}
                  type="checkbox"
                  checked={todo.isComplete ?? false}
                  onChange={() => handleToggleComplete(todo)}
                />
                <label
                  htmlFor={todo.id.toString()}
                  className={`ml-2 text-[16px] select-none text-lg ${
                    todo.isComplete
                      ? "line-through text-gray-500"
                      : "text-gray-800"
                  }`}
                >
                  {todo.title}
                </label>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
