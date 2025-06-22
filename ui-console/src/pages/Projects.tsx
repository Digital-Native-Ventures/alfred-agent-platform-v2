import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Folder, Clock, Users } from "lucide-react";

const mockProjects = [
  { id: "1", name: "E-commerce Agent", status: "Active", agents: 3, lastUpdated: "2 hours ago" },
  { id: "2", name: "Customer Support AI", status: "Active", agents: 5, lastUpdated: "5 hours ago" },
  { id: "3", name: "Data Analysis Bot", status: "Paused", agents: 2, lastUpdated: "1 day ago" },
  { id: "4", name: "Marketing Assistant", status: "Active", agents: 4, lastUpdated: "3 hours ago" },
];

export default function Projects() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your AI agent projects</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Folder className="h-5 w-5 text-muted-foreground" />
                <span className={`text-xs px-2 py-1 rounded-full ${
                  project.status === "Active" 
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                }`}>
                  {project.status}
                </span>
              </div>
              <CardTitle className="mt-4">{project.name}</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {project.agents} agents
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {project.lastUpdated}
                  </span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={`/projects/${project.id}/plan`}>
                <Button variant="outline" className="w-full">View Plan</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
