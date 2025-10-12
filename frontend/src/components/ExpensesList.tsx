// frontend/src/components/ExpensesList.tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export type Expense = {
  id: number;
  title: string;
  amount: number;
  fileUrl: string | null;
};

export function ExpensesList() {
  const qc = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching, // background refresh state
  } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await fetch("/api/expenses", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load expenses");
      return (await res.json()) as { expenses: Expense[] };
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete expense");
      return id;
    },
    onMutate: async (id) => {
      setDeleteError(null);
      await qc.cancelQueries({ queryKey: ["expenses"] });
      const previous = qc.getQueryData<{ expenses: Expense[] }>(["expenses"]);
      if (previous) {
        qc.setQueryData(["expenses"], {
          expenses: previous.expenses.filter((e) => e.id !== id),
        });
      }
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(["expenses"], ctx.previous);
      setDeleteError("Could not delete expense. Please try again.");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
  //       <svg
  //         className="h-4 w-4 animate-spin"
  //         viewBox="0 0 24 24"
  //         aria-hidden="true"
  //       >
  //         <circle
  //           className="opacity-25"
  //           cx="12"
  //           cy="12"
  //           r="10"
  //           stroke="currentColor"
  //           strokeWidth="4"
  //         />
  //         <path
  //           className="opacity-75"
  //           fill="currentColor"
  //           d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
  //         />
  //       </svg>
  //       Loading expenses…
  //     </div>
  //   );
  // }

  if (isLoading) {
    return (
      <ul className="mt-4 space-y-2">
        {[...Array(4)].map((_, i) => (
          <li key={i} className="animate-pulse rounded border bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="h-4 w-16 rounded bg-slate-200" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (isError) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        <p>Could not load expenses. Please try again.</p>
        <button
          className="mt-2 rounded border border-red-300 px-3 py-1 text-xs text-red-700"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  const items = data?.expenses ?? [];

  // Empty state
  if (items.length === 0) {
    return (
      <div className="rounded border bg-background p-6 text-center">
        <div className="rounded border bg-background p-6 text-center">
          <h3 className="text-lg font-semibold">No expenses yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Start by adding your first expense using the form above.
          </p>
        </div>
        <div className="mt-4">
          <button
            className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {deleteError && (
        <div className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {deleteError}
        </div>
      )}

      <div className="mb-2 flex items-center justify-end">
        <button
          className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* <ul className="space-y-2">
        {items.map((expense) => {
          const isRowDeleting =
            deleteExpense.isPending && deleteExpense.variables === expense.id;

          return (
            <li
              key={expense.id}
              className="flex items-center justify-between rounded border bg-background p-3 shadow-sm"
            >
              <div className="flex flex-col">
                <span className="font-medium">{expense.title}</span>
                <span className="text-sm text-muted-foreground">
                  ${Number(expense.amount).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {expense.fileUrl && (
                  <a
                    href={expense.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline"
                  >
                    Download
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (!confirm("Delete this expense?")) return;
                    deleteExpense.mutate(expense.id);
                  }}
                  disabled={isRowDeleting}
                  className="text-sm text-red-600 underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isRowDeleting ? "Removing…" : "Delete"}
                </button>
              </div>
            </li>
          );
        })}
      </ul> */}

      <ul className="mt-4 space-y-2">
        {data?.expenses.map((expense) => (
          <li
            key={expense.id}
            className="flex items-center justify-between rounded border bg-background p-3 shadow-sm"
          >
            <div className="flex flex-col">
              <Link
                to="/expenses/$id"
                params={{ id: String(expense.id) }}
                className="font-medium underline hover:text-primary"
              >
                {expense.title}
              </Link>
              <span className="text-sm text-muted-foreground">
                ${expense.amount}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {expense.fileUrl && (
                <a
                  href={expense.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline"
                >
                  Download
                </a>
              )}
              <button
                type="button"
                onClick={() => deleteExpense.mutate(expense.id)}
                disabled={deleteExpense.isPending}
                className="text-sm text-red-600 underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteExpense.isPending ? "Removing…" : "Delete"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
