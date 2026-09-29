"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Props = {
  onSubmit: (key: string) => Promise<void>;
  onClose: () => void;
};

export function ApiKeyModal({ onSubmit, onClose }: Props) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape" && !loading) onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, loading]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try { await onSubmit(key.trim()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load models."); }
    finally { setLoading(false); }
  };

  return <div className="key-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onClose(); }}>
    <section className="key-modal" role="dialog" aria-modal="true" aria-labelledby="key-title" aria-describedby="key-description">
      <button className="key-close" onClick={onClose} disabled={loading} aria-label="Close">×</button>
      <span className="small-label">LIVE MODEL DATA</span>
      <h2 id="key-title">Add your API key</h2>
      <p id="key-description">Use your own <a href="https://artificialanalysis.ai/api-key-management-redirect" target="_blank" rel="noreferrer">Artificial Analysis key</a> to compare real models. We save the key in this browser only and send it to our server to request your data. Do not use this on a shared device.</p>
      <form onSubmit={submit}>
        <label htmlFor="api-key" className="field-label">ARTIFICIAL ANALYSIS API KEY</label>
        <input ref={input} id="api-key" type="password" value={key} onChange={(event) => setKey(event.target.value)} autoComplete="off" required />
        {error && <p role="alert" className="key-error">{error}</p>}
        <button className="key-submit" type="submit" disabled={loading}>{loading ? "Loading models…" : "Load models"}</button>
      </form>
      <p className="key-note">Your Free API terms still apply. Do not share live results without permission.</p>
    </section>
  </div>;
}
