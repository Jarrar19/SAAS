import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { config } from "./config/env.js";

async function bootstrap() {
  await connectDB();
  const app = createApp();

  app.listen(config.PORT, () => {
    console.log(`[Flowmetrics API] Server listening on http://localhost:${config.PORT}`);
    console.log(`[Flowmetrics API] CORS allowed origin: ${config.CORS_ORIGIN}`);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
