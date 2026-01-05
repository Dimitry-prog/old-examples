import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authApi";
import { rtkQueryErrorLogger } from "./middleware/errorMiddleware";
import authReducer from "./slices/authSlice";
import exampleReducer from "./slices/exampleSlice";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		example: exampleReducer,
		// RTK Query API
		[authApi.reducerPath]: authApi.reducer,
		// Здесь добавляйте другие reducers
	},
	// Добавляем middleware для RTK Query + глобальная обработка ошибок
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware()
			.concat(authApi.middleware)
			.concat(rtkQueryErrorLogger),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
