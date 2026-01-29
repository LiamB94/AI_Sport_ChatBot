from fastapi import FastAPI
from pydantic import BaseModel, Field
import torch

app = FastAPI(title="AI Sports Model Service", version="0.1.0")

class InferRequest(BaseModel):
    question: str = Field(min_length=3)

class InferResponse(BaseModel):
    pick: str
    confidence: float
    reasons: list[str]
    counter: list[str]
    context_notes: list[str]
    sources: list[str]

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/infer", response_model=InferResponse)
def infer(req: InferRequest):
    # Placeholder “PyTorch usage” so it’s real, not just a stub
    _ = torch.tensor([1.0]) * 1.0

    # TODO: replace with real model inference
    return InferResponse(
        pick="TBD",
        confidence=0.55,
        reasons=[
            "Model service wired up successfully",
            f"Received question: {req.question}",
        ],
        counter=[],
        context_notes=["Swap in real PyTorch model next"],
        sources=[]
    )
