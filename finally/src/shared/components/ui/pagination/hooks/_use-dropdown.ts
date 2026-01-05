import { useEffect, useRef, useState } from "react";

export type UseDropdownReturn<T> = {
	isOpen: (id: T) => boolean;
	open: (id: T) => void;
	close: () => void;
	toggle: (id: T) => void;
	dropdownRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * Hook for managing dropdown state with click-outside handling
 * @internal - Do not import directly, use Pagination component
 */
export const _useDropdown = <T = string>(): UseDropdownReturn<T> => {
	const [openDropdown, setOpenDropdown] = useState<T | null>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setOpenDropdown(null);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return {
		isOpen: (id: T) => openDropdown === id,
		open: (id: T) => setOpenDropdown(id),
		close: () => setOpenDropdown(null),
		toggle: (id: T) => setOpenDropdown(openDropdown === id ? null : id),
		dropdownRef,
	};
};
