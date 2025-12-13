import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, GitBranch, Lock, Globe, Clock } from "lucide-react";
import type { RepositoryInfo } from "@shared/schema";

interface RepositoryInfoCardProps {
  repository: RepositoryInfo | null;
}

export function RepositoryInfoCard({ repository }: RepositoryInfoCardProps) {
  if (!repository) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Repository Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <GitBranch className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No repository connected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Repository Info
        </CardTitle>
        <Badge 
          variant={repository.private ? "secondary" : "outline"} 
          className="text-xs"
          data-testid="badge-repo-visibility"
        >
          {repository.private ? (
            <>
              <Lock className="h-3 w-3 mr-1" />
              Private
            </>
          ) : (
            <>
              <Globe className="h-3 w-3 mr-1" />
              Public
            </>
          )}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold" data-testid="text-repo-name">
            {repository.name}
          </h3>
          {repository.description && (
            <p className="text-sm text-muted-foreground mt-1" data-testid="text-repo-description">
              {repository.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Branch</p>
            <div className="flex items-center gap-1">
              <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-sm" data-testid="text-default-branch">
                {repository.defaultBranch}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Last Push</p>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm" data-testid="text-last-push">
                {formatDate(repository.pushedAt)}
              </span>
            </div>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          asChild
          data-testid="button-open-github"
        >
          <a href={repository.htmlUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open on GitHub
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
