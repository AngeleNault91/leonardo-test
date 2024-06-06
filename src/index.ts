import express from 'express';
import scheduleRouter from './routes/schedule';
import taskRouter from './routes/task';

const app = express();
app.use(express.json());

app.use('/schedules', scheduleRouter);
app.use('/tasks', taskRouter);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
