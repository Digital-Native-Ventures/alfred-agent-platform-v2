import { useEffect, useState } from "react";
import { Circle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Service {
  name: string;
  url: string;
  status: "ok" | "error" | "loading";
}

export default function ServiceHealth() {
  const [services, setServices] = useState<Service[]>([
    { name: "API", url: "http://localhost:8083/healthz", status: "loading" },
    { name: "n8n", url: "http://localhost:5678/healthz", status: "loading" },
    { name: "Redis", url: "http://localhost:6379", status: "loading" },
    { name: "Postgres", url: "http://localhost:5432", status: "loading" },
  ]);

  useEffect(() => {
    const checkHealth = async () => {
      const updatedServices = await Promise.all(
        services.map(async (service) => {
          try {
            const response = await fetch(service.url, { 
              mode: 'cors',
              timeout: 5000 
            });
            return {
              ...service,
              status: response.ok ? "ok" as const : "error" as const,
            };
          } catch {
            return {
              ...service,
              status: "error" as const,
            };
          }
        })
      );
      setServices(updatedServices);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: Service["status"]) => {
    switch (status) {
      case "ok":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "loading":
        return "text-muted-foreground animate-pulse";
    }
  };

  const getStatusText = (status: Service["status"]) => {
    switch (status) {
      case "ok":
        return "Online";
      case "error":
        return "Offline";
      case "loading":
        return "Checking...";
    }
  };

  return (
    <div className="flex items-center gap-2" data-testid="service-health">
      {services.map((service) => (
        <Tooltip key={service.name}>
          <TooltipTrigger asChild>
            <Circle 
              className={`h-3 w-3 ${getStatusColor(service.status)}`}
              fill="currentColor"
            />
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <div className="font-medium">{service.name}</div>
              <div className="text-muted-foreground">{getStatusText(service.status)}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}