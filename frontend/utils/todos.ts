import { API_URLS } from "@/constants/apiUrls";
import { Todo } from "@/types/todo";
import { handleApiError } from "./apiErrors";

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
      await handleApiError(response, "Failed to fetch todos");
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

export interface CreateTodoPayload {
  title: string;
  dueDate?: string | null;
}

export async function createNewTodo(token: string, payload: CreateTodoPayload) {
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
      body: JSON.stringify({
        title: payload.title,
        dueDate:
          payload.dueDate === undefined || payload.dueDate === ""
            ? null
            : payload.dueDate,
      }),
    });

    if (!response.ok) {
      await handleApiError(response, "Failed to create todo");
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
      await handleApiError(response, "Failed to update todo");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
  }
}

export async function deleteTodo(token: string, id: number, retries = 2) {
  try {
    const response = await fetch(`${API_URLS.TODOS}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      await handleApiError(response, "Failed to delete todo");
    }
  } catch (error) {
    if (retries > 0) {
      return deleteTodo(token, id, retries - 1);
    }
    if (error instanceof Error) {
      throw error;
    }
  }
}

function chunkArray(ids: number[], size = 10) {
  const result = [];
  for (let i = 0; i < ids.length; i += size) {
    result.push(ids.slice(i, i + size));
  }

  return result;
}

/**
 * Deletes all todos inside a batch (parallel inside the batch)
 */
async function deleteBatch(token: string, batch: number[]) {
  return Promise.all(batch.map((id) => deleteTodo(token, id)));
}

/**
 * Deletes batches one by one in queue
 */
export async function deleteTodosInOrder(
  token: string,
  selectedTodoIds: number[]
) {
  const batches = chunkArray(selectedTodoIds, 10);
  for (let i = 0; i < batches.length; i++) {
    await deleteBatch(token, batches[i]);
  }
}
