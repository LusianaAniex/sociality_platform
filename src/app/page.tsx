export default function HomePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Your Feed</h1>
        <p className="text-gray-500">Welcome back to Sociality!</p>
      </header>

      {/* Placeholder for the Feed content */}
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-lg bg-white shadow-sm border p-4 flex items-center justify-center text-gray-400">
            Post Placeholder #{i}
          </div>
        ))}
      </div>
    </div>
  );
}