declare module "@radix-ui/react-icons" {
	import * as React from "react";

	export type IconProps = React.SVGAttributes<SVGElement> & {
		children?: never;
		color?: string;
	};

	export type Icon = React.ForwardRefExoticComponent<
		IconProps & React.RefAttributes<SVGSVGElement>
	>;

	export const MagnifyingGlassIcon: Icon;
	// Add other icons as needed
}
