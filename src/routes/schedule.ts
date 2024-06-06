import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { account_id, agent_id, start_time, end_time } = req.body;
  try {
    const schedule = await prisma.schedule.create({
      data: {
        account_id,
        agent_id,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
      },
    });
    res.json(schedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);

  try {
    const [schedules, total] = await prisma.$transaction([
      prisma.schedule.findMany({
        skip,
        take,
        include: { tasks: true },
      }),
      prisma.schedule.count(),
    ]);

    res.json({
      data: schedules,
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
  const { account_id, agent_id, start_time, end_time } = req.body;
  try {
    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        account_id,
        agent_id,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
      },
    });
    res.json(schedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.schedule.delete({
      where: { id },
    });
    res.json({ message: 'Schedule deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
