import { Button } from "@/components/ui/button";
import type { User } from "@/types/users";
import { useLingui } from "@lingui/react/macro";
import { Edit, Eye, Trash2 } from "lucide-react";

type UsersTableActionsProps = {
	user: User;
};

export function UsersTableActions({ user }: UsersTableActionsProps) {
	const { t } = useLingui();

	const handleView = () => {
		console.log("View user:", user.id);
		// TODO: Implement view user functionality
	};

	const handleEdit = () => {
		console.log("Edit user:", user.id);
		// TODO: Implement edit user functionality
	};

	const handleDelete = () => {
		console.log("Delete user:", user.id);
		// TODO: Implement delete user functionality
	};

	return (
		<div className="flex items-center gap-2">
			<Button
				variant="ghost"
				size="sm"
				onClick={handleView}
				title={t`Просмотр`}
			>
				<Eye className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={handleEdit}
				title={t`Редактировать`}
			>
				<Edit className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={handleDelete}
				title={t`Удалить`}
			>
				<Trash2 className="h-4 w-4 text-destructive" />
			</Button>
		</div>
	);
}
