// /frontend/src/routes/expenses.detail.tsx
import UploadExpenseForm from "@/components/UploadExpenseForm";
import { useQuery } from "@tanstack/react-query";

type Expense = {
  id: number;
  title: string;
  amount: number;
  fileUrl: string | null;
};
const API = "/api"; // if you’re using Vite proxy; otherwise "http://localhost:3000/api"

export default function ExpenseDetailPage({ id }: { id: number }) {
  // useQuery caches by key ['expenses', id]

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["expenses", id],
    queryFn: async () => {
      const res = await fetch(`${API}/expenses/${id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch expense with id ${id}`);
      return res.json() as Promise<{ expense: Expense }>;
    },
  });

  if (isLoading)
    return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;
  if (isError)
    return (
      <p className="p-6 text-sm text-red-600">{(error as Error).message}</p>
    );

  const item = data?.expense;

  if (!item) {
    return (
      <p className="p-6 text-sm text-muted-foreground">Expense not found.</p>
    );
  }

  return (
    <section className="mx-auto max-w-3xl p-6">
      <div className="rounded border bg-background text-foreground p-6">
        <h2 className="text-xl font-semibold">{item.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">Amount</p>
        <p className="text-lg tabular-nums">#{item.amount}</p>
      </div>

      <div className="rounded border bg-background text-foreground p-6">
        <h3 className="text-base font-medium mb-3">Upload Receipt</h3>
        <UploadExpenseForm
          expenseId={item.id}
          onUploaded={() => {
            refetch();
            // …or: qc.invalidateQueries({ queryKey: ["expense", id] });
          }}
        />
      </div>

      <div className="rounded border bg-background text-foreground p-6">
        <h3 className="text-base font-medium mb-2">Receipt</h3>
        {item.fileUrl ? (
          <a
            className="text-blue-600 underline"
            href={item.fileUrl}
            target="_blank"
            rel="noreferrer"
          >
            Download Receipt
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">Receipt not uploaded</p>
        )}
      </div>
    </section>
  );
}
