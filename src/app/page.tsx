export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <title>Assembly Auction House</title>
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to the Assembly Auction House</h1>
      <h2 className="text-2xl text-gray-700 mb-4">Log In</h2>
      <div className="flex flex-col w-full max-w-sm space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="mt-4 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Log In
        </button>
      </div>
    </div>
  );
}
