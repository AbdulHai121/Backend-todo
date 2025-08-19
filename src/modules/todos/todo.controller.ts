
import { Request, response, Response } from 'express';
import prisma from '../../config/db';
import { AuthRequest } from '../../middlewares/authMiddleware';

export const getTodo = async (req: AuthRequest, res: Response) => {
 const Userid = req.user?.id;
 if (!Userid){
  return res.status(401).json({ error: 'Unauthorized' });
 }  // Get user ID from authenticated request

  try {
    const todo = await prisma.todo.findMany(
      {where: { userId: Userid }}, // Fetch todos for the authenticated user
    );
    res.status(200).json({message:'Todo Find Successfully',data: todo});
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
   
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
};

export const createTodo = async (req: AuthRequest, res: Response) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Missing title' });
  }

  try {
    const todo = await prisma.todo.create({
      data: {
        title,
        userId: req.user!.id, // Authenticated user
      },
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
};

export const updateTodo = async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id); // Convert string to number
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const { title, completed } = req.body;
  if (!title && completed === undefined) {
    return res.status(400).json({ error: 'At least one field (title or completed) is required' });
  }

  try {
    const todo = await prisma.todo.findUnique({
      where: { id },
    });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    if (todo.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: {
        title: title !== undefined ? title : todo.title,
        completed: completed !== undefined ? completed : todo.completed,
      },
    });
    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
};

export const deleteTodo = async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const userid = req.user?.id;// Convert string to num
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const todo = await prisma.todo.findUnique({
      where: { id },
    });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    if (todo.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    await prisma.todo.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
};
