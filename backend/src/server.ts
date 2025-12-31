import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";
import { connectDB } from "./config/db";
import { startCronJob } from "./jobs/cron.job";


const startServer = async () => {
  await connectDB();

  app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
  );

  startCronJob();
};

startServer();
