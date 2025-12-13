import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Clock, 
  ExternalLink,
  CloudUpload
} from "lucide-react";
import type { BuildInfo, PagesInfo } from "@shared/schema";
import { cn } from "@/lib/utils";

interface DeploymentStatusCardProps {
  pages: PagesInfo | null;
  latestBuild: BuildInfo | null;
  onTriggerRebuild?: () => void;
  isRebuilding?: boolean;
}

export function DeploymentStatusCard({ 
  pages, 
  latestBuild,
  onTriggerRebuild,
  isRebuilding 
}: DeploymentStatusCardProps) {
  const getStatusIcon = () => {
    if (!latestBuild) return <Clock className="h-5 w-5 text-muted-foreground" />;
    
    switch (latestBuild.status) {
      case "built":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "building":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case "errored":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    if (!latestBuild) return { label: "No Builds", variant: "outline" as const };
    
    switch (latestBuild.status) {
      case "built":
        return { label: "Success", variant: "default" as const };
      case "building":
        return { label: "Building", variant: "secondary" as const };
      case "errored":
        return { label: "Failed", variant: "destructive" as const };
      default:
        return { label: latestBuild.status, variant: "outline" as const };
    }
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return "N/A";
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusBadge = getStatusBadge();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Deployment Status
        </CardTitle>
        <Badge variant={statusBadge.variant} className="text-xs" data-testid="badge-deploy-status">
          {statusBadge.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-muted">
            {getStatusIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium" data-testid="text-build-status">
                {latestBuild ? latestBuild.status.charAt(0).toUpperCase() + latestBuild.status.slice(1) : "No builds yet"}
              </span>
            </div>
            {latestBuild && (
              <p className="text-xs text-muted-foreground truncate" data-testid="text-build-time">
                {formatDate(latestBuild.createdAt)}
              </p>
            )}
          </div>
        </div>

        {latestBuild?.status === "building" && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Building...</span>
              <span>In progress</span>
            </div>
            <Progress value={45} className="h-1" />
          </div>
        )}

        {latestBuild?.error?.message && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium" data-testid="text-build-error">
              {latestBuild.error.message}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          {pages?.source && (
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Source</p>
              <span className="font-mono text-sm" data-testid="text-pages-source">
                {pages.source.branch}/{pages.source.path}
              </span>
            </div>
          )}
          {latestBuild?.duration && (
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Duration</p>
              <span className="text-sm" data-testid="text-build-duration">
                {formatDuration(latestBuild.duration)}
              </span>
            </div>
          )}
        </div>

        {pages?.cname && (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Custom Domain</p>
            <a 
              href={`https://${pages.cname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono hover:underline"
              data-testid="link-custom-domain"
            >
              {pages.cname}
            </a>
          </div>
        )}

        <Button 
          variant="outline" 
          className="w-full"
          onClick={onTriggerRebuild}
          disabled={isRebuilding || latestBuild?.status === "building"}
          data-testid="button-trigger-rebuild"
        >
          {isRebuilding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Triggering Rebuild...
            </>
          ) : (
            <>
              <CloudUpload className="mr-2 h-4 w-4" />
              Trigger Rebuild
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
