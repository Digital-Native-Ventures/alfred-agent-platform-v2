export default function Topbar() {
  return (
    <header className="h-12 flex items-center justify-between px-4 bg-white shadow">
      <h1 className="font-semibold">Alfred Console</h1>
      <div className="flex gap-3 text-xs">
        {["API", "n8n", "Slack"].map((s) => (
          <div key={s} className="flex items-center gap-1" title={`${s} healthy`}>
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            {s}
          </div>
        ))}
      </div>
    </header>
  );
}