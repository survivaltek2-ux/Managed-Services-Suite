import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import replitAuthRouter from "./replitAuth";
import replitSsoRouter from "./replit-auth";
import ssoRouter from "./sso";
import contactRouter from "./contact";
import quotesRouter from "./quotes";
import ticketsRouter from "./tickets";
import chatRouter from "./chat";
import cmsRouter from "./cms";
import partnersRouter from "./partners";
import openaiRouter from "./openai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(replitAuthRouter);
router.use(replitSsoRouter);
router.use(ssoRouter);
router.use(contactRouter);
router.use(quotesRouter);
router.use(ticketsRouter);
router.use(chatRouter);
router.use(cmsRouter);
router.use(partnersRouter);
router.use(openaiRouter);

export default router;
