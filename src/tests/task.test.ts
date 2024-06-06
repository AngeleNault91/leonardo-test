import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../index';

const prisma = new PrismaClient();

describe('Task API', () => {
  let scheduleId: string;
  let taskId: string;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    const schedule = await prisma.schedule.create({
      data: { account_id: 1, agent_id: 1, start_time: new Date(), end_time: new Date(Date.now() + 3600000) },
    });
    scheduleId = schedule.id;
  });

  afterEach(async () => {
    await prisma.task.deleteMany({});
    await prisma.schedule.deleteMany({});
  });

  it('should create a new task', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({
        account_id: 1,
        schedule_id: scheduleId,
        start_time: new Date().toISOString(),
        duration: 30,
        type: 'work',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    taskId = res.body.id;
  });

  it('should get all tasks with pagination', async () => {
    await prisma.task.createMany({
      data: [
        { account_id: 1, schedule_id: scheduleId, start_time: new Date(), duration: 30, type: 'work' },
        { account_id: 2, schedule_id: scheduleId, start_time: new Date(), duration: 45, type: 'break' },
      ],
    });

    const res = await request(app).get('/tasks?page=1&pageSize=1');

    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta).toHaveProperty('total');
    expect(res.body.meta).toHaveProperty('page');
    expect(res.body.meta).toHaveProperty('pageSize');
    expect(res.body.meta).toHaveProperty('totalPages');
  });

  it('should update a task', async () => {
    const task = await prisma.task.create({
      data: { account_id: 1, schedule_id: scheduleId, start_time: new Date(), duration: 30, type: 'work' },
    });

    const res = await request(app)
      .put(`/tasks/${task.id}`)
      .send({
        account_id: 2,
        schedule_id: scheduleId,
        start_time: new Date().toISOString(),
        duration: 45,
        type: 'break',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.account_id).toEqual(2);
    expect(res.body.duration).toEqual(45);
    expect(res.body.type).toEqual('break');
  });

  it('should delete a task', async () => {
    const task = await prisma.task.create({
      data: { account_id: 1, schedule_id: scheduleId, start_time: new Date(), duration: 30, type: 'work' },
    });

    const res = await request(app).delete(`/tasks/${task.id}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Task deleted');
  });
});
