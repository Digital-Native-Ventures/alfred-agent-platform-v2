import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty, CommandGroup } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FileText, MessageSquare, Activity, Users, BarChart2, Home } from "lucide-react";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const commands = [
    {
      label: "Go to Dashboard",
      action: () => navigate("/"),
      icon: Home,
    },
    {
      label: "View Agents",
      action: () => navigate("/agents"),
      icon: Users,
    },
    {
      label: "Open Architect Chat",
      action: () => navigate("/chat"),
      icon: MessageSquare,
    },
    {
      label: "View Reports",
      action: () => navigate("/reports"),
      icon: BarChart2,
    },
    {
      label: "View Phase 8 Plan",
      action: () => navigate("/plan/8"),
      icon: FileText,
    },
    {
      label: "Create New PRD",
      action: () => navigate("/chat?prompt=create-prd"),
      icon: FileText,
    },
    {
      label: "View Activity",
      action: () => navigate("/"),
      icon: Activity,
    },
  ];

  const handleSelect = (callback: () => void) => {
    callback();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg p-0">
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              {commands.map((command) => (
                <CommandItem
                  key={command.label}
                  onSelect={() => handleSelect(command.action)}
                  className="flex items-center gap-2"
                >
                  <command.icon className="h-4 w-4" />
                  {command.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}