import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import contactRouter from "./contact";
import quotesRouter from "./quotes";
import ticketsRouter from "./tickets";
import chatRouter from "./chat";
import cmsRouter from "./cms";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(contactRouter);
router.use(quotesRouter);
router.use(ticketsRouter);
router.use(chatRouter);
router.use(cmsRouter);

export default router;
