"use client";

import { Todo } from "@/types/todo";
import { deleteTodo, updateTodo } from "@/utils/todos";
import { useCallback, useState } from "react";
import { TodoForm } from "./TodoForm";

interface TodoListProps {
  initialTodos: Todo[];
}
export function TodoList(props: TodoListProps) {
  const { initialTodos } = props;
  const [todos, setTodos] = useState(initialTodos);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAddTodoSuccess = useCallback((todo: Todo) => {
    setTodos((prev) => [...prev, todo]);
  }, []);

  const handleToggleComplete = useCallback(
    async (todo: Todo) => {
      const updatedTodo = {
        ...todo,
        isComplete: !todo.isComplete,
      };

      setErrorMessage("");
      // Optimistically update the UI state before the API call
      setTodos(todos.map((t) => (t.id === todo.id ? updatedTodo : t)));

      try {
        await updateTodo(updatedTodo);
      } catch (error) {
        // Revert the state on failure
        setTodos(todos.map((t) => (t.id === todo.id ? todo : t)));
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
      }
    },
    [todos]
  );

  const handleDeleteTodo = useCallback(
    async (id: number) => {
      const previousTodos = [...todos];

      // Optimistically update the UI state
      setTodos(todos.filter((t) => t.id !== id));
      try {
        await deleteTodo(id);
      } catch (error) {
        setTodos(previousTodos);
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
      }
    },
    [todos]
  );

  return (
    <>
      <TodoForm onSuccess={handleAddTodoSuccess} />
      {todos.length === 0 ? (
        <p>No tasks yet! Add one above.</p>
      ) : (
        <ul>
          {errorMessage && <p className="color-red">{errorMessage}</p>}
          {todos.map((todo) => (
            <li key={todo.id}>
              <input
                id={todo.id.toString()}
                type="checkbox"
                checked={todo.isComplete ?? false}
                onChange={() => handleToggleComplete(todo)}
              />
              <label
                htmlFor={todo.id.toString()}
                className={`select-none text-lg ${
                  todo.isComplete
                    ? "line-through text-gray-500"
                    : "text-gray-800"
                }`}
              >
                {todo.title}
              </label>
              <button type="button" onClick={() => handleDeleteTodo(todo.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
