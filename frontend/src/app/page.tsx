export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-700 mb-4">
          Welcome to Cargo Account
        </h1>
        <p className="text-gray-600 mb-6">
          Manage your cargo operations efficiently
        </p>
        <a
          href="/login"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
