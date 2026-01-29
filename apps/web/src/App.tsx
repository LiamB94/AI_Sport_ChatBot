import { useEffect, useMemo, useState } from "react";
import "./App.css";

type AnswerJson = {
  pick: string;
  confidence: number;
  reasons: string[];
  counter: string[];
  context_notes: string[];
  sources: string[];
};

type MatchupRow = {
  id: string;
  question: string;
  createdAt: string;
  result: null | {
    id: string;
    requestId: string;
    answerJson: AnswerJson;
    createdAt: string;
  };
};

type MatchupCreateResponse = {
  request: { id: string; question: string; createdAt: string };
  result: { id: string; requestId: string; answerJson: AnswerJson; createdAt: string };
};

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function App() {
  const API_URL = useMemo(() => import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000", []);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [history, setHistory] = useState<MatchupRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [selected, setSelected] = useState<MatchupRow | null>(null);

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const resp = await fetch(`${API_URL}/matchups?limit=25`);
      if (!resp.ok) throw new Error(`History fetch failed: ${resp.status}`);
      const rows = (await resp.json()) as MatchupRow[];
      setHistory(rows);
      // auto-select most recent if nothing selected yet
      if (!selected && rows.length > 0) setSelected(rows[0]);
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  }

  async function loadById(id: string) {
    setErr(null);
    try {
      const resp = await fetch(`${API_URL}/matchups/${id}`);
      if (!resp.ok) throw new Error(`Load failed: ${resp.status}`);
      const row = (await resp.json()) as MatchupRow;
      setSelected(row);
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Failed to load matchup");
    }
  }

  async function submit() {
    setErr(null);
    setLoading(true);

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

      const json = (await resp.json()) as MatchupCreateResponse;

      // After creating, refresh history and select the new one
      await loadHistory();
      await loadById(json.request.id);

      setQuestion("");
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const answer = selected?.result?.answerJson;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 340,
          borderRight: "1px solid #ddd",
          padding: 16,
          overflowY: "auto",
        }}
      >
        <h2 style={{ marginTop: 0 }}>History</h2>

        {historyLoading && <div style={{ opacity: 0.7 }}>Loading...</div>}
        {!historyLoading && history.length === 0 && <div style={{ opacity: 0.7 }}>No matchups yet.</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {history.map((h) => {
            const isSelected = selected?.id === h.id;
            return (
              <button
                key={h.id}
                onClick={() => loadById(h.id)}
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderRadius: 12,
                  border: isSelected ? "2px solid #111" : "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.7 }}>{fmtTime(h.createdAt)}</div>
                <div style={{ fontWeight: 700, marginTop: 4, lineHeight: 1.2 }}>{h.question}</div>
                <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                  {h.result?.answerJson?.pick ? `Pick: ${h.result.answerJson.pick}` : "No result yet"}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        <h1 style={{ marginTop: 0 }}>MatchUp AI</h1>
        <p style={{ opacity: 0.8 }}>
          Ask a matchup question → it gets stored → model service returns structured JSON → you can browse history.
        </p>

        {/* Input */}
        <div style={{ display: "flex", gap: 12, marginTop: 16, maxWidth: 900 }}>
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

        {/* Selected result */}
        <div style={{ marginTop: 20, maxWidth: 900 }}>
          {!selected && <div style={{ opacity: 0.7 }}>Pick a matchup from the left, or submit a new one.</div>}

          {selected && (
            <div style={{ padding: 16, borderRadius: 14, border: "1px solid #ddd" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Question</div>
                  <div style={{ fontWeight: 700 }}>{selected.question}</div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                    {fmtTime(selected.createdAt)} • ID: {selected.id}
                  </div>
                </div>

                {answer && (
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Confidence</div>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>{Math.round(answer.confidence * 100)}%</div>
                  </div>
                )}
              </div>

              <hr style={{ margin: "16px 0", opacity: 0.3 }} />

              {!answer && <div style={{ opacity: 0.7 }}>No result found for this request.</div>}

              {answer && (
                <>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Pick</div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>{answer.pick}</div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Reasons</div>
                    <ul>
                      {answer.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {answer.counter.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>Counter</div>
                      <ul>
                        {answer.counter.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {answer.context_notes.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>Context notes</div>
                      <ul>
                        {answer.context_notes.map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
