import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  RefreshCw,
  Wrench 
} from "lucide-react";
import { cn } from "@/lib/utils";

type HealthStatus = "healthy" | "down" | "issues" | "checking" | "unknown";

interface HealthStatusCardProps {
  status: HealthStatus;
  siteUrl?: string | null;
  lastChecked?: string;
  issueCount?: number;
  onDiagnose?: () => void;
  onFix?: () => void;
  isFixing?: boolean;
  isDiagnosing?: boolean;
}

const statusConfig: Record<HealthStatus, { 
  icon: typeof CheckCircle2; 
  label: string; 
  className: string;
  badgeVariant: "default" | "destructive" | "secondary" | "outline";
}> = {
  healthy: {
    icon: CheckCircle2,
    label: "Site is Online",
    className: "text-green-500 dark:text-green-400",
    badgeVariant: "default",
  },
  down: {
    icon: XCircle,
    label: "Site is Down",
    className: "text-red-500 dark:text-red-400",
    badgeVariant: "destructive",
  },
  issues: {
    icon: AlertTriangle,
    label: "Issues Detected",
    className: "text-amber-500 dark:text-amber-400",
    badgeVariant: "secondary",
  },
  checking: {
    icon: Loader2,
    label: "Checking Status...",
    className: "text-muted-foreground animate-spin",
    badgeVariant: "outline",
  },
  unknown: {
    icon: AlertTriangle,
    label: "Status Unknown",
    className: "text-muted-foreground",
    badgeVariant: "outline",
  },
};

export function HealthStatusCard({
  status,
  siteUrl,
  lastChecked,
  issueCount = 0,
  onDiagnose,
  onFix,
  isFixing,
  isDiagnosing,
}: HealthStatusCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Health Status
        </CardTitle>
        <Badge variant={config.badgeVariant} className="text-xs" data-testid="badge-health-status">
          {status === "issues" && issueCount > 0 ? `${issueCount} Issues` : config.label}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 py-4">
          <Icon className={cn("h-16 w-16", config.className)} data-testid="icon-health-status" />
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold" data-testid="text-health-label">
              {config.label}
            </h3>
            {siteUrl && (
              <a 
                href={siteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:underline font-mono"
                data-testid="link-site-url"
              >
                {siteUrl}
              </a>
            )}
            {lastChecked && (
              <p className="text-xs text-muted-foreground" data-testid="text-last-checked">
                Last checked: {new Date(lastChecked).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onDiagnose}
            disabled={isDiagnosing}
            data-testid="button-diagnose"
          >
            {isDiagnosing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {isDiagnosing ? "Diagnosing..." : "Re-diagnose"}
          </Button>
          {status !== "healthy" && issueCount > 0 && (
            <Button 
              className="flex-1"
              onClick={onFix}
              disabled={isFixing}
              data-testid="button-fix-issues"
            >
              {isFixing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wrench className="mr-2 h-4 w-4" />
              )}
              {isFixing ? "Fixing..." : "Fix Issues"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
