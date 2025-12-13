import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, Terminal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LogEntry {
  line: number;
  content: string;
  type: "info" | "error" | "warning" | "success";
}

interface LogViewerProps {
  logs: LogEntry[];
  title?: string;
}

export function LogViewer({ logs, title = "Build Logs" }: LogViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const logText = logs.map(l => l.content).join("\n");
    await navigator.clipboard.writeText(logText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLineStyle = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return "text-red-500 dark:text-red-400";
      case "warning":
        return "text-amber-500 dark:text-amber-400";
      case "success":
        return "text-green-500 dark:text-green-400";
      default:
        return "text-muted-foreground";
    }
  };

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Terminal className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No logs available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          data-testid="button-copy-logs"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 rounded-md border bg-muted/30" data-testid="scrollarea-logs">
          <div className="p-4 font-mono text-sm">
            {logs.map((log) => (
              <div
                key={log.line}
                className="flex gap-4 py-0.5"
                data-testid={`log-line-${log.line}`}
              >
                <span className="w-8 text-right text-muted-foreground/50 select-none shrink-0">
                  {log.line}
                </span>
                <span className={cn("flex-1", getLineStyle(log.type))}>
                  {log.content}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
