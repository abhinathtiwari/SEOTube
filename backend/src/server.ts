/** Entry point of the server; initializes database connections and starts listening. */
import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";
import { connectDB } from "./config/db";
import { startCronJob } from "./jobs/cron.job";
import { startReminderCron } from "./jobs/reminder.job";


const startServer = async () => {
  await connectDB();

  app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
  );

  startCronJob();
  startReminderCron();
};

startServer();
