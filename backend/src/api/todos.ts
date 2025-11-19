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
  const { title, dueDate } = req.body;

  try {
    let parsedDueDate: Date | null = null;
    if (dueDate !== undefined && dueDate !== null && dueDate !== "") {
      parsedDueDate = new Date(dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({ message: "Invalid due date" });
      }

      // Validate due date is in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      parsedDueDate.setHours(0, 0, 0, 0);

      if (parsedDueDate < today) {
        return res
          .status(400)
          .json({ message: "Due date must be in the future" });
      }
    }

    const newTodo = todoRepository.create({
      title,
      isCompleted: false,
      dueDate: parsedDueDate,
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
  const { title, isCompleted, dueDate } = req.body;

  try {
    let todoToUpdate = await todoRepository.findOne({
      where: { id: todoId, userId },
    });

    if (!todoToUpdate) {
      return res.status(404).json({ message: "Todo not found" });
    }

    if (title !== undefined) todoToUpdate.title = title;
    if (isCompleted !== undefined) todoToUpdate.isCompleted = isCompleted;
    if (dueDate !== undefined) {
      if (dueDate === null || dueDate === "") {
        todoToUpdate.dueDate = null;
      } else {
        const parsedDueDate = new Date(dueDate);
        if (isNaN(parsedDueDate.getTime())) {
          return res.status(400).json({ message: "Invalid due date" });
        }

        // Validate due date is in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        parsedDueDate.setHours(0, 0, 0, 0);

        if (parsedDueDate < today) {
          return res
            .status(400)
            .json({ message: "Due date must be in the future" });
        }

        todoToUpdate.dueDate = parsedDueDate;
      }
    }

    const result = await todoRepository.save(todoToUpdate);
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
