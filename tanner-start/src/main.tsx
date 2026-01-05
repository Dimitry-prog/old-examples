import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { QueryDevButton } from "./components/debug/QueryDevPanel";
import { AuthProvider } from "./contexts/AuthContext";
import { QueryProvider } from "./contexts/QueryContext";
import { store } from "./store/store";
import "./styles/globals.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const container = document.getElementById("root");
if (!container) {
	throw new Error("Root element not found");
}

const root = createRoot(container);

root.render(
	<StrictMode>
		<Provider store={store}>
			<QueryProvider enableDevtools={true} enablePersistence={true}>
				<AuthProvider>
					<RouterProvider router={router} />
					<QueryDevButton />
				</AuthProvider>
			</QueryProvider>
		</Provider>
	</StrictMode>,
);
