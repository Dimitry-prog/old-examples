/**
 * Глобальная система уведомлений для RTK Query
 * Можно заменить на вашу библиотеку toast (react-hot-toast, sonner, etc.)
 */

type ToastType = "success" | "error" | "info" | "warning";

class NotificationService {
	private toastFn: ((message: string, type: ToastType) => void) | null = null;

	/**
	 * Инициализация с вашей toast библиотекой
	 */
	init(toastFunction: (message: string, type: ToastType) => void) {
		this.toastFn = toastFunction;
	}

	success(message: string) {
		if (this.toastFn) {
			this.toastFn(message, "success");
		} else {
			console.log("✅", message);
		}
	}

	error(message: string) {
		if (this.toastFn) {
			this.toastFn(message, "error");
		} else {
			console.error("❌", message);
		}
	}

	info(message: string) {
		if (this.toastFn) {
			this.toastFn(message, "info");
		} else {
			console.info("ℹ️", message);
		}
	}

	warning(message: string) {
		if (this.toastFn) {
			this.toastFn(message, "warning");
		} else {
			console.warn("⚠️", message);
		}
	}
}

export const notify = new NotificationService();

/**
 * Извлечение сообщения об ошибке из RTK Query error
 */
export function getErrorMessage(error: any): string {
	if (error?.data?.message) {
		return error.data.message;
	}

	if (error?.message) {
		return error.message;
	}

	if (typeof error?.data === "string") {
		return error.data;
	}

	if (error?.status) {
		return `Ошибка ${error.status}`;
	}

	return "Произошла ошибка";
}
