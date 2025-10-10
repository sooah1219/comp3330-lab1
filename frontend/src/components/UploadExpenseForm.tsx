import React, { useState } from "react";

type Props = {
  expenseId: number;
  onUploaded?: () => void; // call to refetch
};

export default function UploadExpenseForm({ expenseId, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Please choose a file.");
      return;
    }
    setBusy(true);
    try {
      // 1) ask backend for signed upload URL
      const { uploadUrl, key } = await fetch("/api/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ filename: file.name, type: file.type }),
      }).then((r) => r.json());

      // 2) upload file directly to S3
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("Upload failed (S3 PUT)");

      // 3) tell backend which expense this file belongs to
      const updRes = await fetch(`/api/expenses/${expenseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fileKey: key }),
      });
      if (!updRes.ok) throw new Error("Failed to save file key");

      setFile(null);
      onUploaded?.();
    } catch (e) {
      setError((e as Error).message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        disabled={busy}
      />
      <button type="submit" disabled={busy || !file}>
        {busy ? "Uploading…" : "Upload Receipt"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
