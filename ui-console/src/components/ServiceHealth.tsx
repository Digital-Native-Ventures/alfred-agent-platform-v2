export default function ServiceHealth() {
  const services = [
    { name: "API", status: "healthy" },
    { name: "Database", status: "healthy" },
    { name: "Queue", status: "healthy" },
  ];

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-1">
        {services.map((service) => (
          <div
            key={service.name}
            className="w-2 h-2 rounded-full bg-green-500"
            title={`${service.name}: ${service.status}`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">All systems operational</span>
    </div>
  );
}