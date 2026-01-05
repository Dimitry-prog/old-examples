import { notify } from "./notifications";

/**
 * Инициализация системы уведомлений
 * Вызовите эту функцию в main.tsx перед рендером приложения
 */

// Пример 1: С react-hot-toast
export function initWithReactHotToast() {
	// import toast from 'react-hot-toast';
	// notify.init((message, type) => {
	//   switch (type) {
	//     case 'success':
	//       toast.success(message);
	//       break;
	//     case 'error':
	//       toast.error(message);
	//       break;
	//     case 'info':
	//       toast(message);
	//       break;
	//     case 'warning':
	//       toast(message, { icon: '⚠️' });
	//       break;
	//   }
	// });
}

// Пример 2: С sonner
export function initWithSonner() {
	// import { toast } from 'sonner';
	// notify.init((message, type) => {
	//   switch (type) {
	//     case 'success':
	//       toast.success(message);
	//       break;
	//     case 'error':
	//       toast.error(message);
	//       break;
	//     case 'info':
	//       toast.info(message);
	//       break;
	//     case 'warning':
	//       toast.warning(message);
	//       break;
	//   }
	// });
}

// Пример 3: С кастомной системой
export function initWithCustomToast() {
	notify.init((message, type) => {
		// Ваша кастомная логика
		const event = new CustomEvent("app:toast", {
			detail: { message, type },
		});
		window.dispatchEvent(event);
	});
}

// Пример 4: Простая консольная версия (для разработки)
export function initWithConsole() {
	notify.init((message, type) => {
		const emoji = {
			success: "✅",
			error: "❌",
			info: "ℹ️",
			warning: "⚠️",
		};
		console.log(`${emoji[type]} ${message}`);
	});
}

// По умолчанию используем консоль
initWithConsole();
