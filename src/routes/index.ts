import { Router } from "express";
import { usersRouter } from "./users.js";
import { customersRouter } from "./customers.js";
import { authRouter } from "./authRouter.js";

export const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/customers", customersRouter);
