import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { GitBranch, Power, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  repositoryName?: string | null;
  isConnected: boolean;
  onDisconnect?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ 
  repositoryName, 
  isConnected, 
  onDisconnect, 
  onRefresh,
  isRefreshing 
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" />
            <h1 className="font-semibold text-lg hidden sm:block" data-testid="text-app-title">
              GitHub Pages Diagnostic Tool
            </h1>
            <h1 className="font-semibold text-lg sm:hidden">
              Pages Diagnostics
            </h1>
          </div>
          
          {isConnected && repositoryName && (
            <>
              <span className="text-muted-foreground hidden sm:block">/</span>
              <Badge variant="secondary" className="font-mono text-xs" data-testid="badge-repo-name">
                {repositoryName}
              </Badge>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isConnected && (
            <>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs gap-1",
                  "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                )}
                data-testid="badge-connection-status"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Connected
              </Badge>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onRefresh}
                disabled={isRefreshing}
                data-testid="button-refresh"
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onDisconnect}
                data-testid="button-disconnect"
              >
                <Power className="h-4 w-4" />
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
