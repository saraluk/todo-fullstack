import { API_URLS } from "@/constants/apiUrls";
import { Todo } from "@/types/todo";

export async function fetchTodos(token: string): Promise<Todo[]> {
  if (!token) {
    console.error("Attempted API call without token.");
    return [];
  }

  try {
    const response = await fetch(API_URLS.TODOS, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

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

export async function createNewTodo(token: string, title: string) {
  if (!token) {
    console.error("Attempted API call without token.");
    return;
  }

  try {
    const response = await fetch(API_URLS.TODOS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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

export async function updateTodo(token: string, todo: Todo) {
  if (!token) {
    console.error("Attempted API call without token.");
    return [];
  }

  try {
    const response = await fetch(`${API_URLS.TODOS}/${todo.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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

export async function deleteTodo(token: string, id: number) {
  try {
    const response = await fetch(`${API_URLS.TODOS}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
