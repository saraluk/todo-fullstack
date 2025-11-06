import { API_URLS } from "@/constants/apiUrls";
import { Todo } from "@/types/todo";

export async function fetchTodos(): Promise<Todo[]> {
  try {
    const response = await fetch(API_URLS.TODOS, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to fetch todos: ${response.status}`);
    }

    const todos: Todo[] = await response.json();
    return todos;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    return [];
  }
}

export async function createNewTodo(title: string) {
  try {
    const response = await fetch(API_URLS.TODOS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error("Failed to create todo");
    }

    const newTodo: Todo = await response.json();
    return newTodo;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
  }
}

export async function updateTodo(todo: Todo) {
  try {
    const response = await fetch(`${API_URLS.TODOS}/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(todo),
    });

    if (!response.ok) {
      throw new Error("Failed to update todo");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
  }
}

export async function deleteTodo(id: number) {
  try {
    const response = await fetch(`${API_URLS.TODOS}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete todo");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
  }
}
