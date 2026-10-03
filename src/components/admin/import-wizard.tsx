"use client";

import Papa from "papaparse";
import { useCallback, useState } from "react";

type Job = { id: string; filename: string; status: string; makerId: string };

export function ImportWizard({ email, jobs: initialJobs }: { email: string; jobs: Job[] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [mapping, setMapping] = useState<Record<string, string> | null>(null);
  const [issues, setIssues] = useState<unknown[]>([]);
  const [flags, setFlags] = useState<unknown[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = useCallback(async (file: File) => {
    setError("");
    setBusy(true);
    try {
      let headers: string[] = [];
      let rows: Record<string, string>[] = [];
      const text = await file.text();
      if (file.name.endsWith(".json")) {
        const parsed = JSON.parse(text) as Record<string, string>[] | { rows?: Record<string, string>[] };
        rows = Array.isArray(parsed) ? parsed : parsed.rows ?? [];
        headers = rows[0] ? Object.keys(rows[0]) : [];
      } else {
        const result = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
        headers = result.meta.fields ?? [];
        rows = result.data;
      }
      if (!headers.length || !rows.length) throw new Error("File is empty or headers are missing.");
      const res = await fetch("/api/v1/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ filename: file.name, headers, rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setMapping(data.mapping);
      setIssues(data.issues ?? []);
      setFlags(data.flags ?? []);
      setJobId(data.jobId);
      setJobs((j) => [{ id: data.jobId, filename: file.name, status: "pending_approval", makerId: email }, ...j]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }, [email]);

  async function approve(id: string) {
    setError("");
    const res = await fetch(`/api/v1/import/${id}`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Approve failed");
      return;
    }
    setJobs((j) => j.map((row) => (row.id === id ? { ...row, status: "live" } : row)));
  }

  async function rollback(id: string) {
    const res = await fetch(`/api/v1/import/${id}?action=rollback`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Rollback failed");
      return;
    }
    setJobs((j) => j.map((row) => (row.id === id ? { ...row, status: "rolled_back" } : row)));
  }

  return (
    <div className="space-y-4 rounded-[var(--radius-card)] border border-line bg-surface p-4">
      <h2 className="font-display text-2xl">Import wizard</h2>
      <p className="text-sm text-muted">CSV or JSON up to 25 MB. Maker: {email}. A different steward approves; rollback is one click.</p>
      <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-dashed border-primary bg-primary-soft px-4 font-semibold text-primary">
        <input
          type="file"
          accept=".csv,.json,text/csv,application/json"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
        {busy ? "Validating…" : "Upload CSV or JSON"}
      </label>
      <p className="text-xs text-muted">Templates: /templates/outcomes.csv · Sample: /samples/organiser.csv</p>
      {error ? <p className="text-danger" role="alert">{error}</p> : null}
      {jobId ? (
        <div className="rounded-xl bg-warm p-3 text-sm">
          <p className="font-semibold">Dry-run job {jobId}</p>
          {mapping ? <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(mapping, null, 2)}</pre> : null}
          {issues.length ? <pre className="mt-2 overflow-auto text-xs text-warning">{JSON.stringify(issues, null, 2)}</pre> : null}
          {flags.length ? <p className="mt-2 text-warning">Swing flags: {JSON.stringify(flags)}</p> : null}
        </div>
      ) : null}
      <table className="w-full text-left text-sm">
        <caption className="text-left font-semibold">Recent jobs</caption>
        <thead><tr><th>File</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.filename}</td>
              <td>{job.status}</td>
              <td className="space-x-2">
                {job.status === "pending_approval" ? (
                  <button type="button" className="font-semibold text-info" onClick={() => void approve(job.id)}>Approve (checker)</button>
                ) : null}
                {job.status === "live" ? (
                  <button type="button" className="font-semibold text-danger" onClick={() => void rollback(job.id)}>Rollback</button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
