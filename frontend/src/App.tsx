import { AddExpenseForm } from "./components/AddExpenseForm";
// import { AppCard } from "./components/AppCard";
import { ExpensesList } from "./components/ExpensesList";
import { ThemeToggle } from "./components/theme-toggle";

export default function App() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-3xl font-bold">COMP3330 – Frontend Setup</h1>
        <nav className="flex items-center gap-4">
            {/* links… */}
            <ThemeToggle />
          </nav>
        <p className="mt-2 text-sm text-muted-foreground">Vite • React • Tailwind • ShadCN</p>
        {/* <AppCard /> */}
        <AddExpenseForm />
        <ExpensesList />
      </div>
    </main>
  )
}
