import React from 'react';

import { Loader } from '@/shared/ui';

import styles from './EmptyTableState.module.scss';

type EmptyTableStateProps = {
	length: number;
	isLoading?: boolean;
};

const EmptyTableState = ({
	length,
	isLoading = false,
}: EmptyTableStateProps) => {
	return (
		<>
			{isLoading ? (
				<div className={styles.loader}>
					<Loader />
				</div>
			) : length === 0 ? (
				<div className={styles.empty}>No data available</div>
			) : null}
		</>
	);
};

export default EmptyTableState;
