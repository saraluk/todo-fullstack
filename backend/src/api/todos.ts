import express, { Request, Response } from "express";

import { AppDataSource } from "../data-source";
import { Todo } from "../entity/Todo";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

const router = express.Router();

const todoRepository = AppDataSource.getRepository(Todo);

// Get all todos
router.get("/", async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    const todos = await todoRepository.find({
      where: { userId },
      order: { id: "DESC" },
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: "Error fetching todos" });
  }
});

// Create a new todo
router.post("/", async (req: Request, res: Response) => {
  const userId = req.userId;
  const { title } = req.body;

  try {
    const newTodo = todoRepository.create({
      title,
      isCompleted: false,
      userId,
    });
    const result = await todoRepository.save(newTodo);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error creating todo" });
  }
});

// Update a todo
router.put("/:id", async (req: Request, res: Response) => {
  const userId = req.userId;
  const todoId = parseInt(req.params.id);
  const { title, isCompleted } = req.body;

  try {
    let todoToUpdate = await todoRepository.findOne({
      where: { id: todoId, userId },
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
router.delete("/:id", async (req: Request, res: Response) => {
  const userId = req.userId;
  const todoId = parseInt(req.params.id);

  try {
    const todoToDelete = await todoRepository.findOne({
      where: { id: todoId, userId },
    });

    if (!todoToDelete) {
      return res.status(404).json({ message: "Todo not found" });
    }

    await todoRepository.remove(todoToDelete);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting todo" });
  }
});

export default router;
