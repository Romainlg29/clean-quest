import { Toaster } from "@/components/ui/sonner";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import z from "zod";

const Root = () => (
  <div className="w-dvw h-dvh flex flex-col overflow-hidden">
    <Outlet />

    <Toaster />
  </div>
);

const search = z.object({ bounds: z.array(z.number()).length(4).optional() });

export const Route = createRootRoute({
  component: Root,
  validateSearch: search.parse,
});
