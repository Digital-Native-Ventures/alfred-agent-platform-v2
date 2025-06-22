import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader2 } from "lucide-react";

export default function PlanPage() {
  const { id } = useParams();
  const [md, setMd] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;
      
      setLoading(true);
      setError("");
      
      try {
        const response = await fetch(`http://localhost:8083/plan/${id}`);
        if (!response.ok) {
          throw new Error(`Plan ${id} not found`);
        }
        const data = await response.json();
        setMd(data.markdown || "No markdown content available");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading plan");
        setMd("");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading plan...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <FileText className="h-5 w-5" />
            Error Loading Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Phase {id} Documentation
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
}