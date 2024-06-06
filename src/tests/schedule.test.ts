import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../index';

const prisma = new PrismaClient();

describe('Schedule API', () => {
  let scheduleId: string;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    await prisma.task.deleteMany({});
    await prisma.schedule.deleteMany({});
  });

  it('should create a new schedule', async () => {
    const res = await request(app)
      .post('/schedules')
      .send({
        account_id: 1,
        agent_id: 1,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    scheduleId = res.body.id;
  });

  it('should get all schedules with pagination', async () => {
    await prisma.schedule.createMany({
      data: [
        { account_id: 1, agent_id: 1, start_time: new Date(), end_time: new Date(Date.now() + 3600000) },
        { account_id: 2, agent_id: 2, start_time: new Date(), end_time: new Date(Date.now() + 7200000) },
      ],
    });

    const res = await request(app).get('/schedules?page=1&pageSize=1');

    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta).toHaveProperty('total');
    expect(res.body.meta).toHaveProperty('page');
    expect(res.body.meta).toHaveProperty('pageSize');
    expect(res.body.meta).toHaveProperty('totalPages');
  });

  it('should update a schedule', async () => {
    const schedule = await prisma.schedule.create({
      data: { account_id: 1, agent_id: 1, start_time: new Date(), end_time: new Date(Date.now() + 3600000) },
    });

    const res = await request(app)
      .put(`/schedules/${schedule.id}`)
      .send({
        account_id: 2,
        agent_id: 2,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 7200000).toISOString(), // 2 hours later
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.account_id).toEqual(2);
    expect(res.body.agent_id).toEqual(2);
  });

  it('should delete a schedule', async () => {
    const schedule = await prisma.schedule.create({
      data: { account_id: 1, agent_id: 1, start_time: new Date(), end_time: new Date(Date.now() + 3600000) },
    });

    const res = await request(app).delete(`/schedules/${schedule.id}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Schedule deleted');
  });
});
