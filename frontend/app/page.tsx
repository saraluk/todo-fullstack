import { TodoList } from "@/components/TodoList";
import { fetchTodos } from "@/utils/todos";

export default async function Home() {
  const initialTodos = await fetchTodos();

  return (
    <main className="p-8 w-full">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      <TodoList initialTodos={initialTodos} />
    </main>
  );
}
