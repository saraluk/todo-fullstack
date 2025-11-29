"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { Todo } from "@/types/todo";
import { AuthenticationError } from "@/utils/apiErrors";
import { deleteTodosInOrder, fetchTodos, updateTodo } from "@/utils/todos";
import { TodoForm } from "./TodoForm";
import { TodoItem } from "./TodoItem";

export function TodoList() {
  const { isAuthenticated, token, logout } = useAuth();

  const [todosMap, setTodosMap] = useState<Map<number, Todo>>(new Map());
  const [selectedTodos, setSelectedTodos] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
      if (error instanceof AuthenticationError) {
        // Session expired - logout automatically
        logout();
        setErrorMessage("Session expired. Please login again.");
      } else {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "An unknown error fetching todos."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, logout]);

  useEffect(() => {
    if (isAuthenticated) {
      handleFetchTodos();
    } else {
      // Clear todos if authenticated status changes to false
      setTodosMap(new Map());
      setIsLoading(false);
    }
  }, [handleFetchTodos, isAuthenticated]);

  const { todosBasedOnSearchQuery, incompleteTodos, completedTodos } =
    useMemo(() => {
      const incomplete: Todo[] = [];
      const completed: Todo[] = [];
      const allTodos = Array.from(todosMap.values());

      // Filter todos by search query if provided
      const filteredTodos = searchQuery.trim()
        ? allTodos.filter((todo) =>
            todo.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
          )
        : allTodos;

      for (const todo of filteredTodos) {
        if (todo.isComplete) {
          completed.push(todo);
        } else {
          incomplete.push(todo);
        }
      }

      return {
        todosBasedOnSearchQuery: filteredTodos,
        incompleteTodos: incomplete,
        completedTodos: completed,
      };
    }, [todosMap, searchQuery]);

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

        if (error instanceof AuthenticationError) {
          // Session expired - logout automatically
          logout();
          setErrorMessage("Session expired. Please login again.");
        } else if (error instanceof Error) {
          setErrorMessage(error.message);
        }
      }
    },
    [isAuthenticated, token, logout]
  );

  const handleDeleteTodo = useCallback(
    async (selectedTodoIds: number[]) => {
      if (!isAuthenticated || !token) {
        setErrorMessage("Please sign in to delete a todo.");
        return;
      }

      const prevTodosMap = new Map(todosMap);
      // Optimistically update the UI state
      setTodosMap((prevTodos) => {
        const newMap = new Map(prevTodos);
        selectedTodoIds.forEach((id) => newMap.delete(id));
        return newMap;
      });

      try {
        await deleteTodosInOrder(token, selectedTodoIds);
      } catch (error) {
        if (error instanceof AuthenticationError) {
          // Session expired - logout automatically
          logout();
          setTodosMap(prevTodosMap); // Restore todos
          setErrorMessage("Session expired. Please login again.");
        } else if (error instanceof Error) {
          setErrorMessage(error.message);
          setTodosMap(prevTodosMap);
        }
      }
    },
    [isAuthenticated, todosMap, token, logout]
  );

  const handleSelectTodos = useCallback(
    (id: number) => {
      const newselectedTodos = new Set(selectedTodos);
      if (newselectedTodos.has(id)) {
        newselectedTodos.delete(id);
        setSelectedTodos(newselectedTodos);
      } else {
        newselectedTodos.add(id);
        setSelectedTodos(newselectedTodos);
      }
    },
    [selectedTodos]
  );

  const handleSelectAll = () => {
    setSelectedTodos(new Set(todosBasedOnSearchQuery.map((todo) => todo.id)));
  };

  const handleUnselectAll = () => {
    setSelectedTodos(new Set());
  };

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    []
  );

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

      {/* Search input */}
      <div className="mt-6 mb-4">
        <label
          htmlFor="search"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Search todos
        </label>
        <input
          id="search"
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by title..."
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="flex items-center gap-[8px] flex-wrap">
        <button
          type="button"
          onClick={handleSelectAll}
          className="px-[10px] py-[4px] bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 rounded-md text-white text-[12px] cursor-pointer"
        >
          Select All
        </button>
        <button
          type="button"
          onClick={handleUnselectAll}
          className="px-[10px] py-[4px] bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 rounded-md text-white text-[12px] cursor-pointer"
          disabled={selectedTodos.size === 0}
        >
          Unselect All
        </button>
        {/** TODO: Wire bulk delete button, handle batching for smaller API calls, retries, and rate-limit control with optimistic updates and rollback if errors */}
        <button
          type="button"
          className="px-[10px] py-[4px] bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 rounded-md text-white text-[12px] cursor-pointer"
          disabled={selectedTodos.size === 0}
          onClick={() => handleDeleteTodo(Array.from(selectedTodos))}
        >
          Delete
        </button>
      </div>

      <h2 className="font-bold text-md mt-[24px] mb-[4px]">Incomplete todos</h2>
      {incompleteTodos.length === 0 ? (
        <p className="text-sm text-gray">
          {searchQuery.trim()
            ? "No incomplete todos match your search."
            : "No tasks yet! Add one above."}
        </p>
      ) : (
        <ul>
          {errorMessage && <p className="color-red">{errorMessage}</p>}
          {incompleteTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTodo}
              onSelect={handleSelectTodos}
              isSelected={selectedTodos.has(todo.id)}
            />
          ))}
        </ul>
      )}
      <h2 className="font-bold text-md mt-[24px] mb-[4px]">Completed todos</h2>
      {completedTodos.length === 0 ? (
        <p className="text-sm text-gray">
          {searchQuery.trim()
            ? "No completed todos match your search."
            : "No completed tasks yet."}
        </p>
      ) : (
        <ul>
          {errorMessage && <p className="color-red">{errorMessage}</p>}
          {completedTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTodo}
              onSelect={handleSelectTodos}
              isSelected={selectedTodos.has(todo.id)}
            />
          ))}
        </ul>
      )}
    </>
  );
}
