export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-header text-4xl text-[#69773D] mb-4">
          Welcome to KU Market
        </h1>
        <p className="font-body text-gray-600 mb-6">
          Your one-stop platform for smarter trading and campus marketplace
          solutions
        </p>
        <a
          href="/login"
          className="bg-[#69773D] text-white px-6 py-3 rounded-lg transition-all 
             hover:bg-gradient-to-r hover:from-[#69773D] hover:to-green-700"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
