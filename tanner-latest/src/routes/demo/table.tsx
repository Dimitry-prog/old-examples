import { createFileRoute } from "@tanstack/react-router";
import { TableDemoPage } from "@/shared/components/ui/table/demo-page";

export const Route = createFileRoute("/demo/table")({
	component: TableDemoPage,
});
