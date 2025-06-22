import { Button } from "@/components/ui/button";
import { Plus, Settings, BarChart } from "lucide-react";

export default function QuickActions() {
  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="font-medium mb-4">Quick Actions</h3>
      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-start">
          <Plus className="mr-2 h-4 w-4" />
          Create New Agent
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <BarChart className="mr-2 h-4 w-4" />
          View Analytics
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" />
          System Settings
        </Button>
      </div>
    </div>
  );
}