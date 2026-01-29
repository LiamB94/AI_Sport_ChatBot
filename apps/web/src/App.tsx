import { useMemo, useState } from "react";
import "./App.css";

type AnswerJson = {
  pick: string;
  confidence: number;
  reasons: string[];
  counter: string[];
  context_notes: string[];
  sources: string[];
};

type MatchupResponse = {
  request: { id: string; question: string; createdAt: string };
  result: { id: string; requestId: string; answerJson: AnswerJson; createdAt: string };
};

export default function App() {
  const API_URL = useMemo(() => import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000", []);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<MatchupResponse | null>(null);

  async function submit() {
    setErr(null);
    setLoading(true);
    setData(null);

    try {
      const resp = await fetch(`${API_URL}/matchups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`API error ${resp.status}: ${text}`);
      }

      const json = (await resp.json()) as MatchupResponse;
      setData(json);
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 24 }}>
      <h1>MatchUp AI</h1>
      <p style={{ opacity: 0.8 }}>
        Ask a matchup question and get a structured answer (stubbed for now).
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <input
          style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #ccc" }}
          placeholder='e.g., "SGA vs Luka this season — who’s better in clutch?"'
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) submit();
          }}
        />
        <button
          onClick={submit}
          disabled={loading || question.trim().length < 3}
          style={{ padding: "12px 16px", borderRadius: 10 }}
        >
          {loading ? "Running..." : "Analyze"}
        </button>
      </div>

      {err && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "#ffe6e6" }}>
          <b>Error:</b> {err}
        </div>
      )}

      {data && (
        <div style={{ marginTop: 20, padding: 16, borderRadius: 14, border: "1px solid #ddd" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Question</div>
              <div style={{ fontWeight: 600 }}>{data.request.question}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Confidence</div>
              <div style={{ fontWeight: 700 }}>{Math.round(data.result.answerJson.confidence * 100)}%</div>
            </div>
          </div>

          <hr style={{ margin: "16px 0", opacity: 0.3 }} />

          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Pick</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{data.result.answerJson.pick}</div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Reasons</div>
            <ul>
              {data.result.answerJson.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          {data.result.answerJson.counter.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Counter</div>
              <ul>
                {data.result.answerJson.counter.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {data.result.answerJson.context_notes.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Context notes</div>
              <ul>
                {data.result.answerJson.context_notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Request ID: {data.request.id}
          </div>
        </div>
      )}
    </div>
  );
}
