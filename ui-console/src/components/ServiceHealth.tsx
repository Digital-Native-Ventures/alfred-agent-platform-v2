export default function ServiceHealth() {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 rounded-full bg-green-500"></div>
      <span className="text-xs text-muted-foreground">All systems operational</span>
    </div>
  );
}