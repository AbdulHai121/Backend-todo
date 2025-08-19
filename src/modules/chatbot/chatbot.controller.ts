import { Request, Response } from "express";
import prisma from "../../config/db";

export const chatWithBot = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    let reply = "Sorry, I didn't understand.";

    // Show pending tasks
    if (/pending/i.test(message)) {
      const todos = await prisma.todo.findMany({ where: { completed: false } });
      reply = todos.length
        ? `You have ${todos.length} pending tasks:\n- ${todos.map(t => t.title).join("\n- ")}`
        : "No pending tasks 🎉";
    }

    // Show completed tasks
    else if (/completed/i.test(message)) {
      const todos = await prisma.todo.findMany({ where: { completed: true } });
      reply = todos.length
        ? `You have ${todos.length} completed tasks:\n- ${todos.map(t => t.title).join("\n- ")}`
        : "No tasks marked as completed.";
    }

    // Mark task complete
    else if (/mark task (\d+) as complete/i.test(message)) {
      const match = message.match(/mark task (\d+) as complete/i);
      const id = match ? Number(match[1]) : null;

      if (id) {
        const todo = await prisma.todo.update({
          where: { id },
          data: { completed: true },
        });
        reply = `✅ Marked "${todo.title}" as completed.`;
      }
    }

    return res.json({ reply });

  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
