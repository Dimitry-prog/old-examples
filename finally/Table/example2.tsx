import React from "react";

import { ColumnType, Table } from "@/shared/ui/Table";
import { financialFormat } from "@/shared/utils/IntlFormat/financialFormat.ts";

import styles from "./WatchListTable.module.scss";

import { WatchListTableRenderComment } from "@/App/Manager/Clients/WatchList/components/WatchListTable/components/WatchListTableRenderComment";
import WatchListTableRenderPeriod from "@/App/Manager/Clients/WatchList/components/WatchListTable/components/WatchListTableRenderPeriod";
import {
	WatchListCommentType,
	WatchListTableDataType,
} from "@/App/Manager/Clients/WatchList/shared/types";

type WatchListTableProps = {
	data: WatchListTableDataType[];
};

const WatchListTable = ({ data }: WatchListTableProps) => {
	const columns: ColumnType<WatchListTableDataType, WatchListCommentType>[] = [
		{
			key: "period",
			label: "",
			isFixed: true,
			renderCell: (value, row) => {
				if (
					!["Today", "Yesterday", "Week", "AllTime"].includes(value as string)
				) {
					return <WatchListTableRenderPeriod value={String(value)} row={row} />;
				}
				return String(value);
			},
			renderSubRow: (comment) => (
				<WatchListTableRenderComment comment={comment} />
			),
		},
		{
			key: "numberOfTrade",
			label: "Trades",
			style: {
				backgroundColor: "var(--light-peach)",
			},
		},
		{
			key: "volume",
			label: "Volume",
			renderCell: (value) => financialFormat(value as number),
			style: {
				backgroundColor: "var(--light-peach)",
			},
		},
		{
			key: "lotsInUsd",
			label: "Lots",
			renderCell: (value) => financialFormat(value as number),
			style: {
				backgroundColor: "var(--light-peach)",
			},
		},
		{
			key: "zeroingProfit",
			label: "Zeroing",
			renderCell: (value) => financialFormat(value as number),
			style: {
				backgroundColor: "var(--light-peach)",
			},
		},
		{
			key: "profitInUsd",
			label: "PnL",
			renderCell: (value) => financialFormat(value as number),
			style: {
				backgroundColor: "var(--light-peach)",
			},
			cellStyle: (value) => {
				const numericValue = parseFloat(String(value));
				if (isNaN(numericValue)) {
					return {};
				}
				if (numericValue > 0) {
					return { color: "var(--blue-medium)" };
				} else if (numericValue < 0) {
					return { color: "#E34E4E" };
				} else {
					return { color: "#828282" };
				}
			},
		},
		{
			key: "deposit",
			label: "Deposit",
			renderCell: (value) => financialFormat(value as number),
			style: {
				backgroundColor: "var(--light-blue-sky)",
			},
		},
		{
			key: "withdrawal",
			label: "Withdrawal",
			renderCell: (value) => financialFormat(value as number),
			style: {
				backgroundColor: "var(--light-blue-sky)",
			},
		},
		{
			key: "depositNet",
			label: "Net Deposit",
			renderCell: (value) => financialFormat(value as number),
			style: {
				backgroundColor: "var(--light-blue-sky)",
			},
		},
		{
			key: "rebateAmountInUsd",
			label: "Rebates Total",
			renderCell: (value) => financialFormat(value as number),
			style: {
				backgroundColor: "var(--light-second-orange)",
			},
		},
		{
			key: "selfRebatesInUsd",
			label: "Self Rebates",
			renderCell: (value) => financialFormat(value as number),
			style: {
				backgroundColor: "var(--light-second-orange)",
			},
		},
		{
			key: "comments",
			label: "",
			colSpan: "auto",
			renderCell: () => "",
			renderSubRow: (comment) => {
				return comment.comment;
			},
		},
	];

	return (
		<div className={styles.wrapper}>
			<Table<WatchListTableDataType, WatchListCommentType>
				name="wl"
				columns={columns}
				rows={data}
				stickyHeader
				maxHeight={360}
				getSubRows={(row) => row.comments || []}
				expandableRows={{
					isExpandable: (row) => !!row.comments && row.comments.length > 0,
					alwaysExpanded: true,
					expandedRowStyles: {
						padding: "8px 16px",
					},
				}}
				rowSeparators={(row) => {
					if (row.period === "AllTime") {
						return {
							height: 10,
						};
					}
					return null;
				}}
				getRowStyles={(row) => {
					if (!["Today", "Yesterday", "Week", "AllTime"].includes(row.period)) {
						return {
							cells: {
								paddingTop: "7px",
								paddingBottom: "7px",
							},
						};
					}
					return {};
				}}
			/>
		</div>
	);
};

export default WatchListTable;
