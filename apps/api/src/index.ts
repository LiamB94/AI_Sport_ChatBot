import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const MODEL_URL = process.env.MODEL_URL ?? "http://127.0.0.1:8000";
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
  let answer: any;

  try {
    const resp = await fetch(`${MODEL_URL}/infer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: parsed.data.question }),
    });

    if (!resp.ok) {
      throw new Error(`Model service error: ${resp.status}`);
    }

    answer = await resp.json();
  } catch (e) {
    // fallback if model service is down
    answer = {
      pick: "TBD",
      confidence: 0.5,
      reasons: ["Model service unavailable, using fallback"],
      counter: [],
      context_notes: [],
      sources: [],
    };
  }

  const result = await prisma.matchupResult.create({
    data: {
      requestId: request.id,
      answerJson: answer,
    },
  });

  res.status(201).json({ request, result });
});

app.get("/matchups", async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 20), 100);

  const rows = await prisma.matchupRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { result: true },
  });

  res.json(rows);
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
