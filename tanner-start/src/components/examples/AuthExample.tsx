import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
	clearError,
	fetchProfileAsync,
	loginAsync,
	logoutAsync,
	refreshTokensAsync,
	selectAuthError,
	selectIsAuthenticated,
	selectIsLoading,
	selectUser,
} from "../../store/slices/authSlice";

export function AuthExample() {
	const dispatch = useAppDispatch();

	// Можно использовать отдельные селекторы
	const user = useAppSelector(selectUser);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const isLoading = useAppSelector(selectIsLoading);
	const error = useAppSelector(selectAuthError);

	// Или получить всё состояние сразу
	// const auth = useAppSelector(selectAuth);

	const [email, setEmail] = useState("user@example.com");
	const [password, setPassword] = useState("password123");

	const handleLogin = async () => {
		try {
			await dispatch(loginAsync({ email, password })).unwrap();
			console.log("Login successful!");
		} catch (error) {
			console.error("Login failed:", error);
		}
	};

	const handleLogout = async () => {
		try {
			await dispatch(logoutAsync()).unwrap();
			console.log("Logout successful!");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const handleRefreshTokens = async () => {
		if (!user?.refreshToken) return;

		try {
			await dispatch(refreshTokensAsync(user.refreshToken)).unwrap();
			console.log("Tokens refreshed!");
		} catch (error) {
			console.error("Token refresh failed:", error);
		}
	};

	const handleFetchProfile = async () => {
		try {
			await dispatch(fetchProfileAsync()).unwrap();
			console.log("Profile loaded!");
		} catch (error) {
			console.error("Profile fetch failed:", error);
		}
	};

	return (
		<div className="p-6 space-y-6 max-w-2xl mx-auto">
			<h2 className="text-2xl font-bold">Redux Auth Example</h2>

			{/* Error Display */}
			{error && (
				<div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
					<div className="flex justify-between items-center">
						<span>{error}</span>
						<button
							type="button"
							onClick={() => dispatch(clearError())}
							className="text-red-700 hover:text-red-900 font-bold"
						>
							✕
						</button>
					</div>
				</div>
			)}

			{/* Auth Status */}
			<div className="p-4 bg-gray-100 rounded space-y-2">
				<p>
					<strong>Status:</strong>{" "}
					{isAuthenticated ? (
						<span className="text-green-600">Authenticated ✓</span>
					) : (
						<span className="text-gray-600">Not authenticated</span>
					)}
				</p>
				{isLoading && <p className="text-blue-600">Loading...</p>}
			</div>

			{/* User Info */}
			{user && (
				<div className="p-4 bg-blue-50 rounded space-y-2">
					<h3 className="font-bold text-lg">User Info:</h3>
					<p>
						<strong>ID:</strong> {user.id}
					</p>
					<p>
						<strong>Email:</strong> {user.email}
					</p>
					<p>
						<strong>Name:</strong> {user.name}
					</p>
					<p>
						<strong>Role:</strong> {user.role}
					</p>
					{user.avatar && (
						<img
							src={user.avatar}
							alt="Avatar"
							className="w-16 h-16 rounded-full"
						/>
					)}
					<details className="mt-2">
						<summary className="cursor-pointer text-sm text-gray-600">
							Show tokens
						</summary>
						<div className="mt-2 text-xs break-all space-y-1">
							<p>
								<strong>Access:</strong> {user.accessToken}
							</p>
							<p>
								<strong>Refresh:</strong> {user.refreshToken}
							</p>
						</div>
					</details>
				</div>
			)}

			{/* Login Form */}
			{!isAuthenticated && (
				<div className="space-y-4">
					<h3 className="font-bold">Login</h3>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Email"
						className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Password"
						className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<button
						type="button"
						onClick={handleLogin}
						disabled={isLoading}
						className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
					>
						{isLoading ? "Logging in..." : "Login"}
					</button>
					<p className="text-sm text-gray-600">
						Tip: Use "error@test.com" to test error handling
					</p>
				</div>
			)}

			{/* Actions */}
			{isAuthenticated && (
				<div className="space-y-2">
					<h3 className="font-bold">Actions</h3>
					<div className="flex flex-wrap gap-2">
						<button
							type="button"
							onClick={handleLogout}
							disabled={isLoading}
							className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
						>
							Logout
						</button>
						<button
							type="button"
							onClick={handleRefreshTokens}
							disabled={isLoading}
							className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
						>
							Refresh Tokens
						</button>
						<button
							type="button"
							onClick={handleFetchProfile}
							disabled={isLoading}
							className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
						>
							Fetch Profile
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
