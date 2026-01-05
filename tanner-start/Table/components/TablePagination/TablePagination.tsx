import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { IconButton } from '@mui/material';

import { Icon, Select } from '@/shared/ui';
import { cn } from '@/shared/utils';

import styles from './TablePagination.module.scss';

type TablePaginationProps = {
	name: string;
	perPage: number;
	total: number;
	perPageOptions: number[];
	isLoading?: boolean;
};

const TablePagination = ({
	name,
	perPage,
	total,
	perPageOptions,
	isLoading,
}: TablePaginationProps) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const searchParamsByTableName = searchParams?.get(name)?.split('-') || [
		0, 10,
	];
	const page = Math.floor(
		(Number(searchParamsByTableName[0]) || 0) /
			(Number(searchParamsByTableName[1]) || 10),
	);
	const [rowsPerPage, setRowsPerPage] = useState({
		value: searchParamsByTableName[1] || perPage,
		label: searchParamsByTableName[1] || perPage,
	});

	const handleChangeSearchParams = (skip: number, take: number) => {
		const newParams = new URLSearchParams(searchParams.toString());
		newParams.set(name, `${skip}-${take}`);
		setSearchParams(newParams);
	};

	const handleFirstPage = () => {
		handleChangeSearchParams(0, Number(rowsPerPage.value));
	};

	const handleNextPage = () => {
		const nextPage = page + 1;
		handleChangeSearchParams(
			nextPage * Number(rowsPerPage.value),
			Number(rowsPerPage.value),
		);
	};

	const handlePrevPage = () => {
		const prevPage = page - 1;
		handleChangeSearchParams(
			prevPage * Number(rowsPerPage.value),
			Number(rowsPerPage.value),
		);
	};

	const handleLastPage = () => {
		const lastPage = Math.ceil(total / Number(rowsPerPage.value)) - 1;
		handleChangeSearchParams(
			lastPage * Number(rowsPerPage.value),
			Number(rowsPerPage.value),
		);
	};

	const handleChangePerPage = (value: { value: number; label: number }) => {
		handleChangeSearchParams(0, value.value);
		setRowsPerPage(value);
	};

	return (
		<div className={cn(styles.wrapper, isLoading && styles.wrapper_loading)}>
			<div className={styles.left}>
				Row per page
				<Select
					value={rowsPerPage}
					onChange={handleChangePerPage}
					options={perPageOptions.map((item) => ({ value: item, label: item }))}
					menuPosition='fixed'
					styles={{
						control: () => ({
							backgroundColor: 'var(--light-gray)',
							border: 'none',
							maxWidth: '75px',
						}),
					}}
				/>
			</div>

			<div className={styles.right}>
				<IconButton onClick={handleFirstPage} disabled={page === 0}>
					<Icon icon='double-chevron-left' />
				</IconButton>
				<IconButton onClick={handlePrevPage} disabled={page === 0}>
					<Icon icon='chevron-left' />
				</IconButton>

				<div>
					{Math.min(
						total,
						Number(searchParamsByTableName[0]) +
							Number(searchParamsByTableName[1]),
					)}{' '}
					of {total}
				</div>

				<IconButton
					onClick={handleNextPage}
					disabled={page >= Math.ceil(total / perPage) - 1}
				>
					<Icon icon='chevron-right' />
				</IconButton>
				<IconButton
					onClick={handleLastPage}
					disabled={page >= Math.ceil(total / perPage) - 1}
				>
					<Icon icon='double-chevron-right' />
				</IconButton>
			</div>
		</div>
	);
};

export default TablePagination;
