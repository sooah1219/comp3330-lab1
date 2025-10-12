import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export type Expense = {
  id: number;
  title: string;
  amount: number;
  fileUrl: string | null;
};

export function AddExpenseForm() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: { title: string; amount: number }) => {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const message = await res.text().catch(() => "");
        throw new Error(message || "Failed to add expense");
      }
      return (await res.json()) as { expense: Expense };
    },
    onMutate: async (newItem) => {
      setFormError(null);
      await qc.cancelQueries({ queryKey: ["expenses"] });
      const previous = qc.getQueryData<{ expenses: Expense[] }>(["expenses"]);

      if (previous) {
        const optimistic: Expense = {
          id: Date.now(),
          title: newItem.title,
          amount: newItem.amount,
          fileUrl: null,
        };
        qc.setQueryData(["expenses"], {
          expenses: [...previous.expenses, optimistic],
        });
      }
      return { previous };
    },
    onError: (_err, _newItem, ctx) => {
      if (ctx?.previous) qc.setQueryData(["expenses"], ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      setTitle("");
      setAmountInput("");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const amount = Number(amountInput);

    if (!title.trim()) return setFormError("Title is required");
    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      return setFormError("Amount must be greater than 0");
    }
    mutation.mutate({ title: title.trim(), amount });
  };

  const amountInvalid =
    amountInput !== "" &&
    (!Number.isFinite(Number(amountInput)) || Number(amountInput) <= 0);

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-wrap items-start gap-3"
    >
      {/* Title */}
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm">
          Title
        </label>
        <input
          id="title"
          className="w-64 rounded border px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="title"
          required
        />
      </div>

      {/* Amount */}
      <div className="flex flex-col gap-1">
        <label htmlFor="amount" className="text-sm">
          Amount
        </label>
        <input
          id="amount"
          className="w-40 rounded border px-3 py-2"
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          inputMode="decimal"
          placeholder="amount"
          aria-invalid={amountInvalid || undefined}
        />
        {amountInvalid && (
          <p className="text-xs text-red-600">Amount must be greater than 0</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="mt-6 rounded bg-black px-3 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        disabled={mutation.isPending}
        aria-busy={mutation.isPending}
      >
        {mutation.isPending ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Adding…
          </span>
        ) : (
          "Add Expense"
        )}
      </button>

      <div className="basis-full" />

      {formError && <p className="text-sm text-red-600">{formError}</p>}
      {mutation.isError && (
        <p className="text-sm text-red-600">
          {mutation.error?.message ?? "Could not add expense."}
        </p>
      )}
    </form>
  );
}
