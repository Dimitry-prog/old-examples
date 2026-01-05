import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen.ts";

export const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultPendingMinMs: 0,
	context: {
		auth: undefined!,
		router: undefined!,
	} as MyRouterContext,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
