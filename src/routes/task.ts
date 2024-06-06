import { Router } from 'express';
import { PrismaClient, TaskType } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { account_id, schedule_id, start_time, duration, type } = req.body;
  try {
    const task = await prisma.task.create({
      data: {
        account_id,
        schedule_id,
        start_time: new Date(start_time),
        duration,
        type: type as TaskType,
      },
    });
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);

  try {
    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        skip,
        take,
      }),
      prisma.task.count(),
    ]);

    res.json({
      data: tasks,
      meta: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { account_id, schedule_id, start_time, duration, type } = req.body;
  try {
    const task = await prisma.task.update({
      where: { id },
      data: {
        account_id,
        schedule_id,
        start_time: new Date(start_time),
        duration,
        type: type as TaskType,
      },
    });
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.task.delete({
      where: { id },
    });
    res.json({ message: 'Task deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
