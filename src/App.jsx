import { useState, useEffect } from "react";

const TEAMS = {
  A: "Whetstone Panthers",
  B: "Hinton Heroes Yellow",
  C: "Bloomsbury Gold",
  D: "Priory Park Yellow",
  E: "Whetstone Lions",
  F: "Limassol",
};

const SCHEDULE = [
  { time: "10:00", home: "A", away: "B" },
  { time: "10:16", home: "C", away: "D" },
  { time: "10:32", home: "E", away: "F" },
  { time: "10:48", home: "A", away: "C" },
  { time: "11:04", home: "B", away: "E" },
  { time: "11:20", home: "F", away: "D" },
  { time: "11:36", home: "E", away: "A" },
  { time: "11:52", home: "C", away: "F" },
  { time: "12:08", home: "D", away: "B" },
  { time: "12:24", home: "C", away: "E" },
  { time: "12:40", home: "A", away: "D" },
  { time: "12:56", home: "F", away: "B" },
  { time: "13:12", home: "D", away: "E" },
  { time: "13:28", home: "B", away: "C" },
  { time: "13:42", home: "F", away: "A" },
];

const TEAM_COLORS = {
  A: { bg: "#16a34a", text: "#fff" },
  B: { bg: "#ca8a04", text: "#fff" },
  C: { bg: "#d97706", text: "#fff" },
  D: { bg: "#7c3aed", text: "#fff" },
  E: { bg: "#dc2626", text: "#fff" },
  F: { bg: "#0284c7", text: "#fff" },
};

const STORAGE_KEY = "summer-sixes-scores";

function computeTable(scores) {
  const stats = {};
  Object.keys(TEAMS).forEach((k) => {
    stats[k] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
  });

  SCHEDULE.forEach((match, i) => {
    const s = scores[i];
    if (!s || s.home === "" || s.away === "") return;
    const hg = parseInt(s.home, 10);
    const ag = parseInt(s.away, 10);
    if (isNaN(hg) || isNaN(ag)) return;

    const h = match.home;
    const a = match.away;

    stats[h].p++; stats[a].p++;
    stats[h].gf += hg; stats[h].ga += ag;
    stats[a].gf += ag; stats[a].ga += hg;

    if (hg > ag) {
      stats[h].w++; stats[h].pts += 3; stats[a].l++;
    } else if (ag > hg) {
      stats[a].w++; stats[a].pts += 3; stats[h].l++;
    } else {
      stats[h].d++; stats[h].pts += 1;
      stats[a].d++; stats[a].pts += 1;
    }
  });

  return Object.entries(stats)
    .map(([k, v]) => ({ key: k, ...v, gd: v.gf - v.ga }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
}

function TeamBadge({ teamKey }) {
  const c = TEAM_COLORS[teamKey];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 22, height: 22, borderRadius: 4,
      background: c.bg, color: c.text,
      fontWeight: 800, fontSize: 12, marginRight: 6, flexShrink: 0
    }}>{teamKey}</span>
  );
}

export default function SummerSixes() {
  const [scores, setScores] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SCHEDULE.map(() => ({ home: "", away: "" }));
  });

  const [activeMatch, setActiveMatch] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    } catch {}
  }, [scores]);

  const table = computeTable(scores);
  const played = scores.filter((s) => s.home !== "" && s.away !== "").length;

  function setScore(i, side, val) {
    setScores((prev) => {
      const next = prev.map((s) => ({ ...s }));
      next[i][side] = val.replace(/\D/g, "").slice(0, 2);
      return next;
    });
  }

  function clearScore(i) {
    setScores((prev) => {
      const next = prev.map((s) => ({ ...s }));
      next[i] = { home: "", away: "" };
      return next;
    });
  }

  function resetAll() {
    if (window.confirm("Clear all scores and start over?")) {
      setScores(SCHEDULE.map(() => ({ home: "", away: "" })));
      setActiveMatch(null);
    }
  }

  const posColors = ["#f59e0b", "#9ca3af", "#92400e"];

  return (
    <div style={{
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      background: "#0f172a",
      minHeight: "100vh",
      color: "#f1f5f9",
      padding: "0 0 40px",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #15803d 0%, #166534 60%, #14532d 100%)",
        padding: "20px 20px 16px",
        borderBottom: "3px solid #ca8a04",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "#bbf7d0", textTransform: "uppercase" }}>
            Whetstone Wanderers
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.5px", color: "#fff", lineHeight: 1.1 }}>
            Summer Sixes ⚽
          </div>
          <div style={{ fontSize: 14, color: "#86efac", marginTop: 2 }}>
            Under 13 · Group 1 · Pitch 7
          </div>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "inline-block",
              background: "rgba(0,0,0,0.25)", borderRadius: 20,
              padding: "3px 12px", fontSize: 12, color: "#fde68a"
            }}>
              {played} / {SCHEDULE.length} games played
            </div>
            {played > 0 && (
              <button onClick={resetAll} style={{
                background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.2)",
                color: "#fca5a5", borderRadius: 20, padding: "3px 12px",
                fontSize: 12, cursor: "pointer"
              }}>Reset all</button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px" }}>

        {/* League Table */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 }}>
            League Table
          </div>
          <div style={{ background: "#1e293b", borderRadius: 12, overflow: "hidden", border: "1px solid #334155" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "28px 1fr 32px 32px 32px 32px 40px 40px",
              padding: "8px 14px", background: "#0f172a",
              fontSize: 10, fontWeight: 700, color: "#64748b",
              textTransform: "uppercase", letterSpacing: "0.1em", gap: 4
            }}>
              <div>#</div><div>Team</div>
              <div style={{ textAlign: "center" }}>P</div>
              <div style={{ textAlign: "center" }}>W</div>
              <div style={{ textAlign: "center" }}>D</div>
              <div style={{ textAlign: "center" }}>L</div>
              <div style={{ textAlign: "center" }}>GD</div>
              <div style={{ textAlign: "center" }}>Pts</div>
            </div>

            {table.map((row, i) => (
              <div key={row.key} style={{
                display: "grid",
                gridTemplateColumns: "28px 1fr 32px 32px 32px 32px 40px 40px",
                padding: "10px 14px",
                borderTop: "1px solid #1e293b",
                background: i === 0 ? "rgba(245,158,11,0.08)" : i % 2 === 0 ? "#1e293b" : "#243044",
                alignItems: "center", gap: 4,
                borderLeft: i < 2 ? `3px solid ${i === 0 ? "#f59e0b" : "#94a3b8"}` : "3px solid transparent",
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: i < 3 ? posColors[i] : "#475569" }}>{i + 1}</div>
                <div style={{ display: "flex", alignItems: "center", fontSize: 13, fontWeight: 600 }}>
                  <TeamBadge teamKey={row.key} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {TEAMS[row.key]}
                  </span>
                </div>
                <div style={{ textAlign: "center", fontSize: 13, color: "#94a3b8" }}>{row.p}</div>
                <div style={{ textAlign: "center", fontSize: 13, color: "#4ade80" }}>{row.w}</div>
                <div style={{ textAlign: "center", fontSize: 13, color: "#94a3b8" }}>{row.d}</div>
                <div style={{ textAlign: "center", fontSize: 13, color: "#f87171" }}>{row.l}</div>
                <div style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: row.gd > 0 ? "#4ade80" : row.gd < 0 ? "#f87171" : "#94a3b8" }}>
                  {row.gd > 0 ? "+" : ""}{row.gd}
                </div>
                <div style={{ textAlign: "center", fontSize: 15, fontWeight: 900, color: "#f1f5f9" }}>{row.pts}</div>
              </div>
            ))}

            <div style={{ padding: "8px 14px", fontSize: 10, color: "#475569", borderTop: "1px solid #334155" }}>
              <span style={{ color: "#f59e0b" }}>■</span> Top 2 advance to semi-finals
            </div>
          </div>
        </div>

        {/* Fixtures */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 }}>
            Fixtures &amp; Scores
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SCHEDULE.map((match, i) => {
              const s = scores[i];
              const hasScore = s.home !== "" && s.away !== "";
              const isActive = activeMatch === i;
              const hg = parseInt(s.home, 10);
              const ag = parseInt(s.away, 10);
              const hWin = hasScore && hg > ag;
              const aWin = hasScore && ag > hg;

              return (
                <div key={i} style={{
                  background: "#1e293b",
                  border: isActive ? "1px solid #3b82f6" : "1px solid #334155",
                  borderRadius: 10, overflow: "hidden",
                }}>
                  <div
                    onClick={() => setActiveMatch(isActive ? null : i)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "42px 1fr auto 1fr",
                      alignItems: "center",
                      padding: "10px 12px",
                      cursor: "pointer", gap: 8,
                    }}
                  >
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{match.time}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <TeamBadge teamKey={match.home} />
                      <span style={{
                        fontSize: 13, fontWeight: hWin ? 800 : 500,
                        color: hWin ? "#fff" : "#cbd5e1",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                      }}>{TEAMS[match.home]}</span>
                    </div>
                    <div style={{
                      textAlign: "center", minWidth: 56,
                      background: "#0f172a", borderRadius: 6, padding: "4px 8px",
                      fontSize: 15, fontWeight: 800, color: "#f1f5f9", letterSpacing: "0.05em"
                    }}>
                      {hasScore ? `${s.home} – ${s.away}` : <span style={{ color: "#334155", fontSize: 12 }}>vs</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                      <span style={{
                        fontSize: 13, fontWeight: aWin ? 800 : 500,
                        color: aWin ? "#fff" : "#cbd5e1",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right"
                      }}>{TEAMS[match.away]}</span>
                      <TeamBadge teamKey={match.away} />
                    </div>
                  </div>

                  {isActive && (
                    <div style={{
                      borderTop: "1px solid #334155",
                      padding: "12px 16px", background: "#0f172a",
                      display: "flex", alignItems: "center", gap: 12
                    }}>
                      <div style={{ flex: 1, textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{TEAMS[match.home]}</div>
                        <input
                          type="number" min="0" max="99"
                          value={s.home}
                          onChange={(e) => setScore(i, "home", e.target.value)}
                          placeholder="0"
                          style={{
                            width: 64, padding: "8px 0", textAlign: "center",
                            background: "#1e293b", border: "2px solid #3b82f6",
                            borderRadius: 8, color: "#fff", fontSize: 22, fontWeight: 800, outline: "none"
                          }}
                        />
                      </div>
                      <div style={{ color: "#475569", fontSize: 18, fontWeight: 700, paddingTop: 20 }}>–</div>
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{TEAMS[match.away]}</div>
                        <input
                          type="number" min="0" max="99"
                          value={s.away}
                          onChange={(e) => setScore(i, "away", e.target.value)}
                          placeholder="0"
                          style={{
                            width: 64, padding: "8px 0", textAlign: "center",
                            background: "#1e293b", border: "2px solid #3b82f6",
                            borderRadius: 8, color: "#fff", fontSize: 22, fontWeight: 800, outline: "none"
                          }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 20 }}>
                        <button
                          onClick={() => setActiveMatch(null)}
                          style={{
                            background: "#16a34a", color: "#fff", border: "none",
                            borderRadius: 6, padding: "6px 14px", fontSize: 12,
                            fontWeight: 700, cursor: "pointer"
                          }}
                        >Save</button>
                        {hasScore && (
                          <button
                            onClick={() => { clearScore(i); setActiveMatch(null); }}
                            style={{
                              background: "#7f1d1d", color: "#fca5a5", border: "none",
                              borderRadius: 6, padding: "6px 14px", fontSize: 11,
                              fontWeight: 600, cursor: "pointer"
                            }}
                          >Clear</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Semi-final note */}
        <div style={{
          marginTop: 24, background: "#1e293b", borderRadius: 10,
          border: "1px solid #ca8a04", padding: "12px 16px",
          fontSize: 12, color: "#fde68a", lineHeight: 1.6
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>🏆 Semi Finals — 14:10</div>
          <div>Winner Gp1 v Runner Up Gp2</div>
          <div>Winner Gp2 v Runner Up Gp1</div>
          <div style={{ marginTop: 4, color: "#94a3b8" }}>Final at 14:30 · Pitch decided by coin toss · Drawn KO games go to penalties</div>
        </div>
      </div>
    </div>
  );
}
