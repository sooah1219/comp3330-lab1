import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  useParams,
} from "@tanstack/react-router";
import App from "./App";
import ExpenseDetailPage from "./routes/expenses.detail";
import ExpensesListPage from "./routes/expenses.list";
import ExpenseNewPage from "./routes/expenses.new";

const rootRoute = createRootRoute({
  component: () => <App />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <p>Home Page</p>,
});

// const expensesRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: "/expenses",
//   component: () => <p>Expenses Layout</p>,
// });

const expensesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expenses",
  component: () => <Outlet />,
});

const expensesIndexRoute = createRoute({
  getParentRoute: () => expensesRoute,
  path: "/",
  component: ExpensesListPage,
});

const expenseNewRoute = createRoute({
  getParentRoute: () => expensesRoute,
  path: "/new",
  component: ExpenseNewPage,
});

function ExpenseDetailWrapper() {
  const { id } = useParams({ from: expenseDetailRoute.id }); // string으로 들어옴
  return <ExpenseDetailPage id={Number(id)} />;
}

const expenseDetailRoute = createRoute({
  getParentRoute: () => expensesRoute,
  path: "/$id",
  component: ExpenseDetailWrapper,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  expensesRoute,
  expensesIndexRoute,
  expenseNewRoute,
  expenseDetailRoute,
]);

const router = createRouter({ routeTree });

export function AppRouter() {
  return <RouterProvider router={router} />;
}
