import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";
import { RepositoryConnectForm } from "@/components/repository-connect-form";
import { HealthStatusCard } from "@/components/health-status-card";
import { RepositoryInfoCard } from "@/components/repository-info-card";
import { DeploymentStatusCard } from "@/components/deployment-status-card";
import { QuickDiagnostics } from "@/components/quick-diagnostics";
import { IssueList } from "@/components/issue-list";
import { LogViewer } from "@/components/log-viewer";
import type { RepositoryInput, DiagnosticReport } from "@shared/schema";
import { GitBranch, FileQuestion, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConnectedRepo {
  owner: string;
  repo: string;
}

export default function Dashboard() {
  const [connectedRepo, setConnectedRepo] = useState<ConnectedRepo | null>(null);
  const [fixingIssueId, setFixingIssueId] = useState<string | null>(null);
  const { toast } = useToast();

  const diagnosticQuery = useQuery<DiagnosticReport>({
    queryKey: ['/api/diagnose', connectedRepo?.owner, connectedRepo?.repo],
    enabled: !!connectedRepo,
  });

  const connectMutation = useMutation({
    mutationFn: async (data: RepositoryInput) => {
      const response = await apiRequest('POST', '/api/connect', data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      setConnectedRepo({ owner: variables.owner, repo: variables.repo });
      queryClient.invalidateQueries({ queryKey: ['/api/diagnose'] });
      toast({
        title: "Connected Successfully",
        description: `Connected to ${variables.owner}/${variables.repo}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to repository",
        variant: "destructive",
      });
    },
  });

  const fixIssueMutation = useMutation({
    mutationFn: async (issueId: string) => {
      setFixingIssueId(issueId);
      const response = await apiRequest('POST', '/api/fix-issue', { 
        owner: connectedRepo?.owner, 
        repo: connectedRepo?.repo, 
        issueId 
      });
      return response.json();
    },
    onSuccess: (data) => {
      setFixingIssueId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/diagnose'] });
      toast({
        title: "Fix Applied",
        description: data.message || "Issue has been fixed successfully",
      });
    },
    onError: (error: Error) => {
      setFixingIssueId(null);
      toast({
        title: "Fix Failed",
        description: error.message || "Failed to apply fix",
        variant: "destructive",
      });
    },
  });

  const rebuildMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/trigger-rebuild', {
        owner: connectedRepo?.owner,
        repo: connectedRepo?.repo,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Rebuild Triggered",
        description: "A new deployment has been triggered. Check back in a few minutes.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Rebuild Failed",
        description: error.message || "Failed to trigger rebuild",
        variant: "destructive",
      });
    },
  });

  const fixAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/fix-all', {
        owner: connectedRepo?.owner,
        repo: connectedRepo?.repo,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/diagnose'] });
      toast({
        title: "Fixes Applied",
        description: data.message || "All auto-fixable issues have been addressed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fix Failed",
        description: error.message || "Failed to apply fixes",
        variant: "destructive",
      });
    },
  });

  const handleConnect = useCallback((data: RepositoryInput) => {
    connectMutation.mutate(data);
  }, [connectMutation]);

  const handleDisconnect = useCallback(() => {
    setConnectedRepo(null);
    queryClient.clear();
  }, []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/diagnose'] });
  }, []);

  const handleFixIssue = useCallback((issueId: string) => {
    fixIssueMutation.mutate(issueId);
  }, [fixIssueMutation]);

  const handleTriggerRebuild = useCallback(() => {
    rebuildMutation.mutate();
  }, [rebuildMutation]);

  const handleFixAll = useCallback(() => {
    fixAllMutation.mutate();
  }, [fixAllMutation]);

  const report = diagnosticQuery.data;
  
  const getHealthStatus = () => {
    if (diagnosticQuery.isLoading) return "checking";
    if (!report) return "unknown";
    if (report.siteReachable && report.issues.length === 0) return "healthy";
    if (!report.siteReachable) return "down";
    if (report.issues.length > 0) return "issues";
    return "unknown";
  };

  const generateLogs = (): { line: number; content: string; type: "info" | "error" | "warning" | "success" }[] => {
    if (!report) return [];
    
    const logs: { line: number; content: string; type: "info" | "error" | "warning" | "success" }[] = [];
    let lineNum = 1;

    logs.push({ line: lineNum++, content: `[${new Date(report.lastChecked).toISOString()}] Starting diagnostics...`, type: "info" });
    
    if (report.repository) {
      logs.push({ line: lineNum++, content: `[INFO] Repository: ${report.repository.fullName}`, type: "info" });
      logs.push({ line: lineNum++, content: `[INFO] Default branch: ${report.repository.defaultBranch}`, type: "info" });
      logs.push({ line: lineNum++, content: `[INFO] Visibility: ${report.repository.private ? 'Private' : 'Public'}`, type: "info" });
    }

    if (report.pages) {
      logs.push({ line: lineNum++, content: `[INFO] Pages status: ${report.pages.status || 'unknown'}`, type: "info" });
      if (report.pages.source) {
        logs.push({ line: lineNum++, content: `[INFO] Source: ${report.pages.source.branch}/${report.pages.source.path}`, type: "info" });
      }
      if (report.pages.cname) {
        logs.push({ line: lineNum++, content: `[INFO] Custom domain: ${report.pages.cname}`, type: "info" });
      }
    }

    if (report.siteReachable) {
      logs.push({ line: lineNum++, content: `[SUCCESS] Site is reachable`, type: "success" });
    } else {
      logs.push({ line: lineNum++, content: `[ERROR] Site is not reachable`, type: "error" });
    }

    report.issues.forEach((issue) => {
      const type = issue.severity === "critical" ? "error" : issue.severity === "warning" ? "warning" : "info";
      logs.push({ line: lineNum++, content: `[${issue.severity.toUpperCase()}] ${issue.title}`, type });
      logs.push({ line: lineNum++, content: `         ${issue.description}`, type: "info" });
    });

    if (report.issues.length === 0) {
      logs.push({ line: lineNum++, content: `[SUCCESS] No issues detected`, type: "success" });
    }

    logs.push({ line: lineNum++, content: `[INFO] Diagnostics complete`, type: "info" });

    return logs;
  };

  if (!connectedRepo) {
    return (
      <div className="min-h-screen bg-background">
        <Header isConnected={false} />
        <main className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <GitBranch className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight" data-testid="text-welcome-title">
                GitHub Pages Diagnostic Tool
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Connect your GitHub repository to diagnose and fix issues with your GitHub Pages site.
              </p>
            </div>
            
            <RepositoryConnectForm 
              onConnect={handleConnect}
              isLoading={connectMutation.isPending}
              defaultOwner="rupeshtiwari"
              defaultRepo="blogs"
            />

            <div className="pt-8 border-t">
              <h2 className="text-sm font-medium text-muted-foreground mb-4">What this tool can do:</h2>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="p-4 rounded-lg bg-muted/30">
                  <FileQuestion className="h-6 w-6 text-primary mb-2" />
                  <h3 className="font-medium">Diagnose Issues</h3>
                  <p className="text-muted-foreground text-xs mt-1">
                    Identify configuration and build problems
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <GitBranch className="h-6 w-6 text-primary mb-2" />
                  <h3 className="font-medium">Auto-Fix</h3>
                  <p className="text-muted-foreground text-xs mt-1">
                    Automatically fix common issues
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <ExternalLink className="h-6 w-6 text-primary mb-2" />
                  <h3 className="font-medium">Deploy</h3>
                  <p className="text-muted-foreground text-xs mt-1">
                    Trigger rebuilds and monitor deployment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isConnected={true}
        repositoryName={`${connectedRepo.owner}/${connectedRepo.repo}`}
        onDisconnect={handleDisconnect}
        onRefresh={handleRefresh}
        isRefreshing={diagnosticQuery.isRefetching}
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <QuickDiagnostics 
          report={report || null} 
          isLoading={diagnosticQuery.isLoading}
        />

        <div className="grid gap-6 md:grid-cols-3">
          <HealthStatusCard
            status={getHealthStatus()}
            siteUrl={report?.pages?.url}
            lastChecked={report?.lastChecked}
            issueCount={report?.issues.length || 0}
            onDiagnose={handleRefresh}
            onFix={handleFixAll}
            isDiagnosing={diagnosticQuery.isRefetching}
            isFixing={fixAllMutation.isPending}
          />
          <RepositoryInfoCard repository={report?.repository || null} />
          <DeploymentStatusCard
            pages={report?.pages || null}
            latestBuild={report?.latestBuild || null}
            onTriggerRebuild={handleTriggerRebuild}
            isRebuilding={rebuildMutation.isPending}
          />
        </div>

        <IssueList 
          issues={report?.issues || []}
          onFixIssue={handleFixIssue}
          fixingIssueId={fixingIssueId}
        />

        <LogViewer logs={generateLogs()} />
      </main>
    </div>
  );
}
