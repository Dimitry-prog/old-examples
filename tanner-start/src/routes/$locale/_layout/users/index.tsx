import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/$locale/_layout/users/")({
	component: () => <Navigate to="./table" />,
});
