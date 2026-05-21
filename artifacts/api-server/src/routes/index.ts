import { Router, type IRouter } from "express";
import healthRouter from "./health";
import checkinsRouter from "./checkins";
import profilesRouter from "./profiles";

const router: IRouter = Router();

router.use(healthRouter);
router.use(checkinsRouter);
router.use(profilesRouter);

export default router;
