import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../api/base-api";
import { rpcApi } from "../api/rpc-api.example";
import { rtkQueryErrorLogger } from "../middleware/rtk-query-error-logger";

export const store = configureStore({
	reducer: {
		[baseApi.reducerPath]: baseApi.reducer,
		[rpcApi.reducerPath]: rpcApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware()
			.concat(baseApi.middleware)
			.concat(rpcApi.middleware)
			.concat(rtkQueryErrorLogger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
