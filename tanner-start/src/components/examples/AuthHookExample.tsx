import { useState } from "react";
import { useAuth } from "../../store/hooks/useAuth";

/**
 * Пример использования хука useAuth
 * Более простой и удобный способ работы с авторизацией
 */
export function AuthHookExample() {
	const {
		user,
		isAuthenticated,
		isLoading,
		error,
		login,
		logout,
		refreshTokens,
		fetchProfile,
		clearError,
		hasRole,
		canAccess,
	} = useAuth();

	const [email, setEmail] = useState("user@example.com");
	const [password, setPassword] = useState("password123");

	const handleLogin = async () => {
		try {
			await login(email, password);
			console.log("Login successful!");
		} catch (error) {
			console.error("Login failed:", error);
		}
	};

	const handleLogout = async () => {
		try {
			await logout();
			console.log("Logout successful!");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	return (
		<div className="p-6 space-y-6 max-w-2xl mx-auto">
			<h2 className="text-2xl font-bold">useAuth Hook Example</h2>
			<p className="text-gray-600">
				Более простой способ работы с авторизацией через кастомный хук
			</p>

			{/* Error Display */}
			{error && (
				<div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
					<div className="flex justify-between items-center">
						<span>{error}</span>
						<button
							type="button"
							onClick={clearError}
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

			{/* User Info & Permissions */}
			{user && (
				<div className="p-4 bg-blue-50 rounded space-y-3">
					<h3 className="font-bold text-lg">User Info:</h3>
					<div className="flex items-center gap-4">
						{user.avatar && (
							<img
								src={user.avatar}
								alt="Avatar"
								className="w-16 h-16 rounded-full"
							/>
						)}
						<div>
							<p className="font-semibold">{user.name}</p>
							<p className="text-sm text-gray-600">{user.email}</p>
							<p className="text-sm">
								<span className="font-medium">Role:</span>{" "}
								<span className="px-2 py-1 bg-blue-200 rounded text-xs">
									{user.role}
								</span>
							</p>
						</div>
					</div>

					{/* Permissions Check */}
					<div className="border-t pt-3 space-y-1">
						<h4 className="font-semibold text-sm">Permissions:</h4>
						<div className="text-sm space-y-1">
							<p>
								Is Admin:{" "}
								{hasRole("admin") ? (
									<span className="text-green-600">✓ Yes</span>
								) : (
									<span className="text-gray-400">✗ No</span>
								)}
							</p>
							<p>
								Is Moderator:{" "}
								{hasRole("moderator") ? (
									<span className="text-green-600">✓ Yes</span>
								) : (
									<span className="text-gray-400">✗ No</span>
								)}
							</p>
							<p>
								Can access admin panel:{" "}
								{canAccess("admin") ? (
									<span className="text-green-600">✓ Yes</span>
								) : (
									<span className="text-gray-400">✗ No</span>
								)}
							</p>
							<p>
								Can access moderator panel:{" "}
								{canAccess("moderator") ? (
									<span className="text-green-600">✓ Yes</span>
								) : (
									<span className="text-gray-400">✗ No</span>
								)}
							</p>
						</div>
					</div>
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
							onClick={refreshTokens}
							disabled={isLoading}
							className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
						>
							Refresh Tokens
						</button>
						<button
							type="button"
							onClick={fetchProfile}
							disabled={isLoading}
							className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
						>
							Fetch Profile
						</button>
					</div>
				</div>
			)}

			{/* Code Example */}
			<div className="p-4 bg-gray-50 rounded">
				<h3 className="font-bold mb-2">Usage Example:</h3>
				<pre className="text-xs overflow-x-auto">
					{`import { useAuth } from '../../store/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login('email', 'password')}>
          Login
        </button>
      )}
    </div>
  );
}`}
				</pre>
			</div>
		</div>
	);
}
