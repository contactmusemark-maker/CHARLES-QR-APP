import "./env";

import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Must be registered early for Render/mobile debugging.
app.get("/", (_req, res) => {
  res.send("Charles API running");
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "charles-api",
    status: "healthy",
  });
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
          origin: req.headers.origin,
          host: req.headers.host,
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Error logging for production debugging (including mobile failures)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl ?? req.url,
      origin: req.headers.origin,
    },
    "Unhandled error",
  );

  if (res.headersSent) return next(err);

  const status =
    err && typeof err === "object" && "status" in err && typeof (err as { status?: unknown }).status === "number"
      ? (err as { status: number }).status
      : 500;

  const message = err instanceof Error ? err.message : "Internal Server Error";
  res.status(status).json({ error: message });
});

export default app;
