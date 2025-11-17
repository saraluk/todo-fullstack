import { TodosPage } from "@/components/TodosPage";

export default async function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-[40px] px-[24px]">
      <TodosPage />
    </div>
  );
}
