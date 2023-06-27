import { nanoid } from "nanoid";
import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.redirect(`/video/${nanoid(6)}`);
});

router.get("/:roomId", async (req: Request, res: Response) => {
  const { roomId } = req.params;

  res.render("room", { roomId });
});

export default router;
