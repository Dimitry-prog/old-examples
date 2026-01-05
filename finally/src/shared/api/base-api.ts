import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Базовая конфигурация API
export const baseApi = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({
		// 	baseUrl: process.env.VITE_API_URL || "/api",
		baseUrl: "/api",
		prepareHeaders: (headers) => {
			// Добавляем токен авторизации, если он есть
			const token = localStorage.getItem("authToken");
			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
			}
			return headers;
		},
	}),
	endpoints: () => ({}),
});
