import app from "./app";
import { logger } from "./lib/logger";

const PORT = process.env.PORT || "3000";

app.listen(Number(PORT), "0.0.0.0", (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port: Number(PORT) }, "Server listening");
});
