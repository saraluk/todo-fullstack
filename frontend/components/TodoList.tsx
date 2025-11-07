"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { Todo } from "@/types/todo";
import { deleteTodo, updateTodo } from "@/utils/todos";
import { TodoForm } from "./TodoForm";
import { TodoItem } from "./TodoItem";

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
