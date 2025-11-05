import * as express from "express";
import { AppDataSource } from "../data-source";
import { Todo } from "../entity/Todo";

const router = express.Router();

const todoRepository = AppDataSource.getRepository(Todo);

// Get all todos
router.get("/", async (req, res) => {
  try {
    const todos = await todoRepository.find();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: "Error fetching todos" });
  }
});

// Create a new todo
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;
    const newTodo = todoRepository.create({ title });
    const result = await todoRepository.save(newTodo);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error creating todo" });
  }
});

// Update a todo
router.put("/:id", async (req, res) => {
  try {
    const todoId = parseInt(req.params.id);
    const { title, isCompleted } = req.body;

    let todoToUpdate = await todoRepository.findOneBy({
      id: todoId,
    });
    if (!todoToUpdate) {
      res.status(404).json({ message: "Todo not found" });
    }

    if (title !== undefined) todoToUpdate.title = title;
    if (isCompleted !== undefined) todoToUpdate.isCompleted = isCompleted;

    const result = todoRepository.save(todoToUpdate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error updating todo" });
  }
});

// Delete a todo
router.delete("/:id", async (req, res) => {
  try {
    const todoId = parseInt(req.params.id);
    const result = await todoRepository.delete(todoId);

    if (result.affected === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting todo" });
  }
});

export default router;
