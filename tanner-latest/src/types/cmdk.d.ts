declare module "cmdk" {
	import * as React from "react";

	export type CommandProps = React.HTMLAttributes<HTMLDivElement> & {
		shouldFilter?: boolean;
		filter?: (value: string, search: string) => number;
	};

	export const Command: React.ForwardRefExoticComponent<
		CommandProps & React.RefAttributes<HTMLDivElement>
	> & {
		Input: React.ForwardRefExoticComponent<
			React.InputHTMLAttributes<HTMLInputElement> & {
				onValueChange?: (value: string) => void;
			} & React.RefAttributes<HTMLInputElement>
		>;
		List: React.ForwardRefExoticComponent<
			React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
		>;
		Empty: React.ForwardRefExoticComponent<
			React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
		>;
		Group: React.ForwardRefExoticComponent<
			React.HTMLAttributes<HTMLDivElement> & {
				heading?: React.ReactNode;
			} & React.RefAttributes<HTMLDivElement>
		>;
		Item: React.ForwardRefExoticComponent<
			React.HTMLAttributes<HTMLDivElement> & {
				disabled?: boolean;
				onSelect?: (value: string) => void;
				value?: string;
			} & React.RefAttributes<HTMLDivElement>
		>;
		Separator: React.ForwardRefExoticComponent<
			React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
		>;
	};

	export function useCommandState<T = any>(selector: (state: any) => T): T;
}
