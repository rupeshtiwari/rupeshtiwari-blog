import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Wrench,
  Loader2,
  CheckCircle2
} from "lucide-react";
import type { Issue } from "@shared/schema";
import { cn } from "@/lib/utils";

interface IssueListProps {
  issues: Issue[];
  onFixIssue?: (issueId: string) => void;
  fixingIssueId?: string | null;
}

const severityConfig = {
  critical: {
    icon: AlertCircle,
    className: "text-red-500 dark:text-red-400",
    bgClassName: "bg-red-500/10",
    borderClassName: "border-red-500/20",
    badgeClassName: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
  warning: {
    icon: AlertTriangle,
    className: "text-amber-500 dark:text-amber-400",
    bgClassName: "bg-amber-500/10",
    borderClassName: "border-amber-500/20",
    badgeClassName: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  info: {
    icon: Info,
    className: "text-blue-500 dark:text-blue-400",
    bgClassName: "bg-blue-500/10",
    borderClassName: "border-blue-500/20",
    badgeClassName: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
};

export function IssueList({ issues, onFixIssue, fixingIssueId }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Diagnostic Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
            <h3 className="font-medium text-lg">No Issues Found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Your GitHub Pages site appears to be configured correctly.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = [];
    }
    acc[issue.category].push(issue);
    return acc;
  }, {} as Record<string, Issue[]>);

  const getCategorySeverity = (categoryIssues: Issue[]) => {
    if (categoryIssues.some(i => i.severity === "critical")) return "critical";
    if (categoryIssues.some(i => i.severity === "warning")) return "warning";
    return "info";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-lg">Diagnostic Results</CardTitle>
        <Badge variant="secondary" className="text-xs" data-testid="badge-issue-count">
          {issues.length} {issues.length === 1 ? "Issue" : "Issues"}
        </Badge>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-2" defaultValue={Object.keys(groupedIssues)}>
          {Object.entries(groupedIssues).map(([category, categoryIssues]) => {
            const severity = getCategorySeverity(categoryIssues);
            const config = severityConfig[severity];
            const Icon = config.icon;

            return (
              <AccordionItem
                key={category}
                value={category}
                className={cn(
                  "border rounded-md px-4",
                  config.borderClassName
                )}
                data-testid={`accordion-category-${category.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-1.5 rounded-md", config.bgClassName)}>
                      <Icon className={cn("h-4 w-4", config.className)} />
                    </div>
                    <span className="font-medium">{category}</span>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs border", config.badgeClassName)}
                    >
                      {categoryIssues.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-3 pt-2">
                    {categoryIssues.map((issue) => {
                      const issueConfig = severityConfig[issue.severity];
                      const IssueIcon = issueConfig.icon;
                      const isFixing = fixingIssueId === issue.id;

                      return (
                        <div
                          key={issue.id}
                          className={cn(
                            "p-3 rounded-md border",
                            issueConfig.bgClassName,
                            issueConfig.borderClassName
                          )}
                          data-testid={`issue-${issue.id}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <IssueIcon className={cn("h-4 w-4 mt-0.5 shrink-0", issueConfig.className)} />
                              <div className="min-w-0">
                                <h4 className="font-medium text-sm" data-testid={`text-issue-title-${issue.id}`}>
                                  {issue.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1" data-testid={`text-issue-description-${issue.id}`}>
                                  {issue.description}
                                </p>
                                {issue.suggestedFix && (
                                  <div className="mt-2 p-2 bg-background/50 rounded text-sm">
                                    <span className="font-medium">Suggested Fix: </span>
                                    <span className="text-muted-foreground">{issue.suggestedFix}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {issue.canAutoFix && onFixIssue && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onFixIssue(issue.id)}
                                disabled={isFixing}
                                className="shrink-0"
                                data-testid={`button-fix-issue-${issue.id}`}
                              >
                                {isFixing ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Wrench className="h-3.5 w-3.5 mr-1" />
                                    Fix
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
