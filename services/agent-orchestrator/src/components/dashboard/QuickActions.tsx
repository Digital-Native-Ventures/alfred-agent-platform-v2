import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Activity, Plus } from "lucide-react";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Create PRD",
      description: "Start a new Product Requirements Document",
      icon: Plus,
      action: () => navigate("/chat?prompt=create-prd"),
      variant: "default" as const,
    },
    {
      label: "View Phase 8",
      description: "Check Phase 8 implementation status",
      icon: FileText,
      action: () => navigate("/plan/8"),
      variant: "outline" as const,
    },
    {
      label: "Architect Chat",
      description: "Ask the AI architect for guidance",
      icon: MessageSquare,
      action: () => navigate("/chat"),
      variant: "outline" as const,
    },
    {
      label: "View Activity",
      description: "Monitor system activity and logs",
      icon: Activity,
      action: () => navigate("/"),
      variant: "outline" as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              className="h-auto p-4 justify-start"
              onClick={action.action}
            >
              <div className="flex items-start gap-3">
                <action.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}