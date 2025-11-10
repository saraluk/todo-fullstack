"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { Todo } from "@/types/todo";
import { deleteTodo, fetchTodos, updateTodo } from "@/utils/todos";
import { TodoForm } from "./TodoForm";
import { TodoItem } from "./TodoItem";

export function TodoList() {
  const { isAuthenticated, token } = useAuth();

  const [todosMap, setTodosMap] = useState<Map<number, Todo>>(new Map());
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  const handleFetchTodos = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setIsLoading(false);
      setErrorMessage(
        "You are not authenticated. Please login to view your todos."
      );
      return;
    }

    setErrorMessage("");
    setIsLoading(true);
    try {
      const todos = await fetchTodos(token);
      setTodosMap(new Map(todos.map((todo) => [todo.id, todo])));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unknown error fetching todos."
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (isAuthenticated) {
      handleFetchTodos();
    } else {
      // Clear todos if authenticated status changes to false
      setTodosMap(new Map());
      setIsLoading(false);
    }
  }, [handleFetchTodos, isAuthenticated]);

  const handleAddTodoSuccess = useCallback((todo: Todo) => {
    setTodosMap((prevTodosMap) => {
      const newTodosMap = new Map(prevTodosMap);
      newTodosMap.set(todo.id, todo);
      return newTodosMap;
    });
  }, []);

  const handleToggleComplete = useCallback(
    async (todo: Todo) => {
      if (!isAuthenticated || !token) {
        setErrorMessage(
          "You need to be logged in to modify your todos. Please login first."
        );
        return;
      }

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
        await updateTodo(token, updatedTodo);
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
    },
    [isAuthenticated, token]
  );

  const handleDeleteTodo = useCallback(
    async (id: number) => {
      if (!isAuthenticated || !token) {
        setErrorMessage("Please sign in to delete a todo.");
        return;
      }

      const prevTodosMap = new Map(todosMap);
      // Optimistically update the UI state
      setTodosMap((prevTodos) => {
        const newMap = new Map(prevTodos);
        newMap.delete(id);
        return newMap;
      });

      try {
        await deleteTodo(token, id);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
          setTodosMap(prevTodosMap);
        }
      }
    },
    [isAuthenticated, todosMap, token]
  );

  const { incompleteTodos, completedTodos } = useMemo(() => {
    const incomplete: Todo[] = [];
    const completed: Todo[] = [];
    const allTodos = Array.from(todosMap.values());
    for (const todo of allTodos) {
      if (todo.isComplete) {
        completed.push(todo);
      } else {
        incomplete.push(todo);
      }
    }

    return { incompleteTodos: incomplete, completedTodos: completed };
  }, [todosMap]);

  if (isLoading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <TodoForm onSuccess={handleAddTodoSuccess} />
      <h2 className="font-bold text-md mt-[24px] mb-[4px]">Incomplete todos</h2>
      {incompleteTodos.length === 0 ? (
        <p className="text-sm text-gray">No tasks yet! Add one above.</p>
      ) : (
        <ul>
          {errorMessage && <p className="color-red">{errorMessage}</p>}
          {incompleteTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTodo}
            />
          ))}
        </ul>
      )}
      <h2 className="font-bold text-md mt-[24px] mb-[4px]">Completed todos</h2>
      {completedTodos.length === 0 ? (
        <p className="text-sm text-gray">No completed tasks yet.</p>
      ) : (
        <ul>
          {errorMessage && <p className="color-red">{errorMessage}</p>}
          {completedTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTodo}
            />
          ))}
        </ul>
      )}
    </>
  );
}
