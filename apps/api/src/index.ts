import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  // quick DB ping
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true });
});

const createMatchupSchema = z.object({
  question: z.string().min(3),
});

app.post("/matchups", async (req, res) => {
  const parsed = createMatchupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const request = await prisma.matchupRequest.create({
    data: { question: parsed.data.question },
  });

  // stub "model output" for now
  const answer = {
    pick: "TBD",
    confidence: 0.5,
    reasons: ["Stub response — model service next"],
    counter: [],
    context_notes: [],
    sources: [],
  };

  const result = await prisma.matchupResult.create({
    data: {
      requestId: request.id,
      answerJson: answer,
    },
  });

  res.status(201).json({ request, result });
});

app.get("/matchups/:id", async (req, res) => {
  const row = await prisma.matchupRequest.findUnique({
    where: { id: req.params.id },
    include: { result: true },
  });

  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
