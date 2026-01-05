import { useState } from "react";
import { useAuthRTK } from "../../store/hooks/useAuthRTK";

/**
 * Пример использования RTK Query для авторизации
 * Более современный подход с автоматическим кешированием и оптимизацией запросов
 */
export function AuthRTKExample() {
	const {
		user,
		profile,
		isAuthenticated,
		isLoading,
		loginError,
		registerError,
		login,
		register,
		logout,
		refreshTokens,
		updateProfile,
		refetchProfile,
		hasRole,
		canAccess,
	} = useAuthRTK();

	const [email, setEmail] = useState("user@example.com");
	const [password, setPassword] = useState("password123");
	const [name, setName] = useState("John Doe");
	const [showRegister, setShowRegister] = useState(false);

	const handleLogin = async () => {
		try {
			await login(email, password);
			console.log("Login successful!");
		} catch (error) {
			console.error("Login failed:", error);
		}
	};

	const handleRegister = async () => {
		try {
			await register(email, password, name);
			console.log("Registration successful!");
			setShowRegister(false);
		} catch (error) {
			console.error("Registration failed:", error);
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

	const handleUpdateProfile = async () => {
		try {
			await updateProfile({ name: "Updated Name" });
			console.log("Profile updated!");
		} catch (error) {
			console.error("Profile update failed:", error);
		}
	};

	const error = loginError || registerError;

	return (
		<div className="p-6 space-y-6 max-w-2xl mx-auto">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">RTK Query Auth Example</h2>
				<span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
					RTK Query
				</span>
			</div>
			<p className="text-gray-600">
				Современный подход с автоматическим кешированием, дедупликацией запросов
				и оптимизацией
			</p>

			{/* Error Display */}
			{error && "status" in error && (
				<div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
					<p>
						<strong>Error {error.status}:</strong>{" "}
						{typeof error.data === "object" &&
						error.data &&
						"message" in error.data
							? String(error.data.message)
							: "An error occurred"}
					</p>
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
				{isLoading && (
					<div className="flex items-center gap-2">
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
						<span className="text-blue-600">Loading...</span>
					</div>
				)}
			</div>

			{/* User Info */}
			{user && (
				<div className="p-4 bg-blue-50 rounded space-y-3">
					<h3 className="font-bold text-lg">User Info (Local State):</h3>
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

					{/* Profile from Server */}
					{profile && profile.name !== user.name && (
						<div className="border-t pt-3">
							<h4 className="font-semibold text-sm mb-2">
								Profile from Server (Cached):
							</h4>
							<p className="text-sm">
								<strong>Name:</strong> {profile.name}
							</p>
							<p className="text-sm text-gray-600">
								RTK Query автоматически кеширует данные профиля
							</p>
						</div>
					)}

					{/* Permissions */}
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

			{/* Login/Register Form */}
			{!isAuthenticated && (
				<div className="space-y-4">
					<div className="flex gap-2 border-b">
						<button
							type="button"
							onClick={() => setShowRegister(false)}
							className={`px-4 py-2 font-medium ${
								!showRegister
									? "border-b-2 border-blue-500 text-blue-600"
									: "text-gray-600"
							}`}
						>
							Login
						</button>
						<button
							type="button"
							onClick={() => setShowRegister(true)}
							className={`px-4 py-2 font-medium ${
								showRegister
									? "border-b-2 border-blue-500 text-blue-600"
									: "text-gray-600"
							}`}
						>
							Register
						</button>
					</div>

					{showRegister && (
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Full Name"
							className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					)}

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
						onClick={showRegister ? handleRegister : handleLogin}
						disabled={isLoading}
						className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
					>
						{isLoading ? "Processing..." : showRegister ? "Register" : "Login"}
					</button>

					<div className="text-sm text-gray-600 space-y-1">
						<p>💡 Tips:</p>
						<ul className="list-disc list-inside space-y-1">
							<li>Use "error@test.com" to test login error</li>
							<li>Use "exists@test.com" to test registration error</li>
						</ul>
					</div>
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
							onClick={handleUpdateProfile}
							disabled={isLoading}
							className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
						>
							Update Profile
						</button>
						<button
							type="button"
							onClick={() => refetchProfile()}
							disabled={isLoading}
							className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-400"
						>
							Refetch Profile
						</button>
					</div>
				</div>
			)}

			{/* RTK Query Features */}
			<div className="p-4 bg-purple-50 rounded">
				<h3 className="font-bold mb-2">🚀 RTK Query Features:</h3>
				<ul className="text-sm space-y-1 list-disc list-inside">
					<li>Автоматическое кеширование данных</li>
					<li>Дедупликация одинаковых запросов</li>
					<li>Автоматическая инвалидация кеша</li>
					<li>Оптимистичные обновления</li>
					<li>Polling и refetching</li>
					<li>Встроенная обработка loading/error состояний</li>
				</ul>
			</div>

			{/* Code Example */}
			<div className="p-4 bg-gray-50 rounded">
				<h3 className="font-bold mb-2">Usage Example:</h3>
				<pre className="text-xs overflow-x-auto">
					{`import { useAuthRTK } from '../../store/hooks/useAuthRTK';

function MyComponent() {
  const {
    user,
    isAuthenticated,
    login,
    logout,
    profile // Автоматически кешируется!
  } = useAuthRTK();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <p>Server profile: {profile?.name}</p>
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
