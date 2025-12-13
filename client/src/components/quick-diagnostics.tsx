import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Globe, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Loader2
} from "lucide-react";
import type { DiagnosticReport } from "@shared/schema";
import { cn } from "@/lib/utils";

interface QuickDiagnosticsProps {
  report: DiagnosticReport | null;
  isLoading?: boolean;
}

interface DiagnosticItemProps {
  title: string;
  icon: typeof Settings;
  status: "success" | "error" | "warning" | "loading" | "unknown";
  value: string;
  testId: string;
}

function DiagnosticItem({ title, icon: Icon, status, value, testId }: DiagnosticItemProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "loading":
        return <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case "success":
        return "bg-green-500/10 border-green-500/20";
      case "error":
        return "bg-red-500/10 border-red-500/20";
      case "warning":
        return "bg-amber-500/10 border-amber-500/20";
      default:
        return "bg-muted/50 border-border";
    }
  };

  return (
    <Card className={cn("border", getStatusBg())} data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
        {getStatusIcon()}
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold" data-testid={`${testId}-value`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

export function QuickDiagnostics({ report, isLoading }: QuickDiagnosticsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <DiagnosticItem
          title="Pages Config"
          icon={Settings}
          status="loading"
          value="Checking..."
          testId="card-pages-config"
        />
        <DiagnosticItem
          title="DNS/Domain"
          icon={Globe}
          status="loading"
          value="Checking..."
          testId="card-dns-status"
        />
        <DiagnosticItem
          title="Build Errors"
          icon={AlertCircle}
          status="loading"
          value="Checking..."
          testId="card-build-errors"
        />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <DiagnosticItem
          title="Pages Config"
          icon={Settings}
          status="unknown"
          value="Not connected"
          testId="card-pages-config"
        />
        <DiagnosticItem
          title="DNS/Domain"
          icon={Globe}
          status="unknown"
          value="Not connected"
          testId="card-dns-status"
        />
        <DiagnosticItem
          title="Build Errors"
          icon={AlertCircle}
          status="unknown"
          value="Not connected"
          testId="card-build-errors"
        />
      </div>
    );
  }

  const pagesConfigured = !!report.pages?.source;
  const hasDomain = !!report.pages?.cname || !!report.pages?.url;
  const buildErrorCount = report.issues.filter(i => i.category === "Build" && i.severity === "critical").length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <DiagnosticItem
        title="Pages Config"
        icon={Settings}
        status={pagesConfigured ? "success" : "error"}
        value={pagesConfigured 
          ? `${report.pages?.source?.branch}/${report.pages?.source?.path}` 
          : "Not Configured"
        }
        testId="card-pages-config"
      />
      <DiagnosticItem
        title="DNS/Domain"
        icon={Globe}
        status={report.siteReachable ? "success" : hasDomain ? "warning" : "error"}
        value={report.pages?.cname || (report.pages?.url ? "GitHub Pages" : "No Domain")}
        testId="card-dns-status"
      />
      <DiagnosticItem
        title="Build Errors"
        icon={AlertCircle}
        status={buildErrorCount === 0 ? "success" : "error"}
        value={buildErrorCount === 0 ? "None" : `${buildErrorCount} Error${buildErrorCount > 1 ? "s" : ""}`}
        testId="card-build-errors"
      />
    </div>
  );
}
