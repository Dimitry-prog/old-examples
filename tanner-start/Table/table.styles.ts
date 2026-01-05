export const table = {
	fontFamily: '"Inter", sans-serif',
	fontStyle: 'normal',

	'& th, & td': {
		fontFamily: 'inherit',
	},
};

export const groupCell = {
	border: 'none',
	textWrap: 'nowrap',
	backgroundColor: 'var(--white)',
};

export const groupHeader = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: '4px',
	fontSize: '14px',
	fontWeight: 500,
	color: 'var(--gray-700)',

	'& > button': {
		padding: 0,
		color: 'var(--dark)',

		'& > svg': {
			width: '14px',
			height: '14px',
		},
	},
};

export const groupHeaderCell = {
	fontSize: '12px',
	fontWeight: 500,
	whiteSpace: 'nowrap',
	color: 'var(--gray-500)',
	top: '56px',
};

export const headerCell = {
	fontSize: '12px',
	fontWeight: 500,
	whiteSpace: 'nowrap',
	color: 'var(--gray-500)',
};

export const bodyCell = {
	padding: '16px',
	fontSize: '12px',
	fontWeight: 400,
	whiteSpace: 'nowrap',
	backgroundColor: 'var(--white)',
	color: 'var(--gray-900)',
};
