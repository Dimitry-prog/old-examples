import React, { useMemo, useState, useCallback } from "react";

import { WrapperTable } from "@/shared/components/WrapperTable";
import { ColumnType, TableData } from "@/shared/ui/Table";

import { DSRStatsHistoryRenderParamsCell } from "./components/DSRStatsHistoryRenderParamsCell";
import { DSRStatsHistoryRenderStatusCell } from "./components/DSRStatsHistoryRenderStatusCell";

import styles from "./DSRStatsHistory.module.scss";

import api from "@/Api/Api";
import { DataSmithReportType } from "@/App/Manager/DataSmith/DataSmithReports/shared/types";
import {
	DataSmithReportStatusType,
	DSRStatsHistoryRowType,
} from "@/App/Manager/DataSmith/DataSmithReports/components/DSRStats/components/DSRStatsHistory/shared/types";
import { formatDate } from "@/shared/utils";
import { Button, Icon, Tooltip } from "@/shared/ui";

type FilterType = {
	reportId: number;
};

type ResponseType = {
	items: DSRStatsHistoryRowType[];
	totalCount: number;
};

type DSRStatsHistoryProps = {
	data: DataSmithReportType;
	refetchTrigger: number;
	onRefetchHistory: () => void;
};

export const DSRStatsHistory = ({
	data,
	refetchTrigger,
	onRefetchHistory,
}: DSRStatsHistoryProps) => {
	const [updatedRows, setUpdatedRows] = useState<
		Record<string, DSRStatsHistoryRowType>
	>({});

	const filters = useMemo(() => {
		return {
			reportId: data.reportId,
		};
	}, [data.reportId]);

	const handleRowUpdate = useCallback(
		(requestId: string, newData: DSRStatsHistoryRowType) => {
			setUpdatedRows((prev) => ({
				...prev,
				[requestId]: newData,
			}));
		},
		[],
	);

	const columns: ColumnType<DSRStatsHistoryRowType>[] = useMemo(() => {
		return [
			{
				key: "created",
				label: "Date",
				renderCell: (value, row) => {
					const updatedRow = updatedRows?.[row.requestId];
					const dateValue =
						updatedRow?.created || (typeof value === "string" ? value : "");
					const utcTime = dateValue.replace("Z", "");
					return formatDate(utcTime, "DD-MM-YYYY HH:mm:ss");
				},
			},
			{
				key: "userName",
				label: "User",
				renderCell: (value, row) => {
					const updatedRow = updatedRows?.[row.requestId];
					return updatedRow?.userName || value;
				},
			},
			{
				key: "version",
				label: "Version",
			},
			{
				key: "queryParamNames",
				label: "Params",
				renderCell: (_value, row) => {
					const updatedRow = updatedRows?.[row.requestId];
					const paramNames =
						updatedRow?.queryParamNames || row?.queryParamNames || [];
					const paramValues =
						updatedRow?.queryParamValues || row?.queryParamValues || [];
					return (
						<DSRStatsHistoryRenderParamsCell
							queryParamNames={paramNames}
							queryParamValues={paramValues}
						/>
					);
				},
			},
			{
				key: "status",
				label: "Status",
				renderCell: (value, row) => {
					const updatedRow = updatedRows?.[row.requestId];
					const currentData = updatedRow || row;

					return (
						<DSRStatsHistoryRenderStatusCell
							status={currentData.status}
							requestId={currentData.requestId}
							logMessage={currentData.statusMessage}
							fileName={data.name}
							onRowUpdate={handleRowUpdate}
						/>
					);
				},
				style: {
					width: "100px",
				},
			},
		];
	}, [updatedRows, data.name, handleRowUpdate]);

	return (
		<WrapperTable
			title="Requests history"
			classes={{
				wrapper: styles.wrapper,
				header: styles.header,
			}}
			filters={
				<Tooltip
					content="Refresh history table"
					activationElement={
						<Button
							onClick={onRefetchHistory}
							styleType="ghost"
							fullWidth={false}
						>
							<Icon icon="refresh" color="var(--gray-900)" />
						</Button>
					}
				/>
			}
		>
			<TableData<DSRStatsHistoryRowType, FilterType, ResponseType>
				name="data-smith-history"
				columns={columns}
				fetchData={api.manager.datasmith.report.request.getRequests}
				getOrderedParamsForFetch={(filters, skip, take) => [
					{
						...filters,
						skip,
						take,
					},
				]}
				filters={filters}
				refetchTrigger={refetchTrigger}
				maxHeight={360}
				stickyHeader
				isLoadOnScroll
			/>
		</WrapperTable>
	);
};
