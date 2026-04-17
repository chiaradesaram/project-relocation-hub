import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/unit-trusts")({
  component: () => <Outlet />,
});
