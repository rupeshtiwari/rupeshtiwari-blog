import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { getUncachableGitHubClient } from "./github";
import { repositoryInputSchema, type DiagnosticReport, type Issue, type RepositoryInfo, type PagesInfo, type BuildInfo } from "@shared/schema";
import { z } from "zod";

const fixIssueInputSchema = repositoryInputSchema.extend({
  issueId: z.string().min(1, "Issue ID is required"),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/connect", async (req: Request, res: Response) => {
    try {
      const parsed = repositoryInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const { owner, repo } = parsed.data;
      
      const octokit = await getUncachableGitHubClient();
      const { data } = await octokit.repos.get({ owner, repo });
      
      res.json({ 
        success: true, 
        repository: {
          id: data.id,
          name: data.name,
          fullName: data.full_name,
          description: data.description,
          private: data.private,
          htmlUrl: data.html_url,
          defaultBranch: data.default_branch,
          pushedAt: data.pushed_at,
          updatedAt: data.updated_at,
        }
      });
    } catch (error: any) {
      console.error("Connect error:", error);
      res.status(500).json({ error: error.message || "Failed to connect to repository" });
    }
  });

  app.get("/api/diagnose", async (req: Request, res: Response) => {
    try {
      const parsed = repositoryInputSchema.safeParse({
        owner: req.query.owner,
        repo: req.query.repo,
      });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const { owner, repo } = parsed.data;

      const octokit = await getUncachableGitHubClient();
      const issues: Issue[] = [];
      
      let repository: RepositoryInfo | null = null;
      let pages: PagesInfo | null = null;
      let latestBuild: BuildInfo | null = null;
      let siteReachable = false;

      try {
        const { data: repoData } = await octokit.repos.get({ owner, repo });
        repository = {
          id: repoData.id,
          name: repoData.name,
          fullName: repoData.full_name,
          description: repoData.description,
          private: repoData.private,
          htmlUrl: repoData.html_url,
          defaultBranch: repoData.default_branch,
          pushedAt: repoData.pushed_at,
          updatedAt: repoData.updated_at,
        };

        if (repoData.private) {
          issues.push({
            id: "private-repo",
            severity: "critical",
            category: "Configuration",
            title: "Repository is Private",
            description: "GitHub Pages requires a public repository for free accounts. Consider making the repository public or upgrading to GitHub Pro.",
            suggestedFix: "Change repository visibility to public in GitHub settings",
            canAutoFix: false,
          });
        }
      } catch (error: any) {
        issues.push({
          id: "repo-not-found",
          severity: "critical",
          category: "Repository",
          title: "Repository Not Found",
          description: error.message || "Could not access the repository. Check if it exists and you have access.",
          suggestedFix: "Verify the repository name and your access permissions",
          canAutoFix: false,
        });
      }

      try {
        const { data: pagesData } = await octokit.repos.getPages({ owner, repo });
        pages = {
          url: pagesData.html_url || pagesData.url || null,
          status: pagesData.status || null,
          cname: pagesData.cname || null,
          custom404: pagesData.custom_404 ?? false,
          httpsCertificate: pagesData.https_certificate ? {
            state: pagesData.https_certificate.state,
            description: pagesData.https_certificate.description,
          } : null,
          source: pagesData.source ? {
            branch: pagesData.source.branch,
            path: pagesData.source.path,
          } : null,
          buildType: pagesData.build_type ?? null,
        };

        if (pagesData.status === "errored") {
          issues.push({
            id: "pages-errored",
            severity: "critical",
            category: "Build",
            title: "GitHub Pages Build Failed",
            description: "The latest GitHub Pages build has failed. Check the Actions tab for more details.",
            suggestedFix: "Review build logs and fix any syntax or configuration errors",
            canAutoFix: false,
          });
        }

        if (pages?.url) {
          try {
            const response = await fetch(pages.url, { method: 'HEAD', redirect: 'follow' });
            siteReachable = response.ok;
          } catch {
            siteReachable = false;
          }
        }

        if (!siteReachable && pages?.url) {
          issues.push({
            id: "site-unreachable",
            severity: "critical",
            category: "Accessibility",
            title: "Site is Not Reachable",
            description: `The site at ${pages?.url} is not responding. This could be due to DNS issues, build failures, or the site being newly deployed.`,
            suggestedFix: "Wait a few minutes if recently deployed, or check DNS configuration",
            canAutoFix: false,
          });
        }

      } catch (error: any) {
        if (error.status === 404) {
          issues.push({
            id: "pages-not-enabled",
            severity: "critical",
            category: "Configuration",
            title: "GitHub Pages Not Enabled",
            description: "GitHub Pages is not enabled for this repository.",
            suggestedFix: "Enable GitHub Pages in repository settings under Pages section",
            canAutoFix: false,
          });
        }
      }

      try {
        const { data: builds } = await octokit.repos.listPagesBuilds({ owner, repo, per_page: 1 });
        if (builds.length > 0) {
          const build = builds[0];
          latestBuild = {
            url: build.url,
            status: build.status,
            error: build.error ? { message: build.error.message } : null,
            pusher: build.pusher ? {
              login: build.pusher.login,
              avatarUrl: build.pusher.avatar_url,
            } : null,
            commit: build.commit,
            duration: build.duration,
            createdAt: build.created_at,
            updatedAt: build.updated_at,
          };

          if (build.error?.message) {
            issues.push({
              id: "build-error",
              severity: "critical",
              category: "Build",
              title: "Build Error",
              description: build.error.message,
              suggestedFix: "Review the error message and fix the underlying issue",
              canAutoFix: false,
            });
          }
        }
      } catch (error) {
        // Builds endpoint might not be available
      }

      try {
        await octokit.repos.getContent({ owner, repo, path: "index.html" });
      } catch {
        try {
          await octokit.repos.getContent({ owner, repo, path: "index.md" });
        } catch {
          try {
            await octokit.repos.getContent({ owner, repo, path: "README.md" });
          } catch {
            issues.push({
              id: "missing-index",
              severity: "warning",
              category: "Content",
              title: "Missing Index File",
              description: "No index.html, index.md, or README.md found in the repository root.",
              suggestedFix: "Create an index.html or index.md file in the repository root",
              canAutoFix: true,
            });
          }
        }
      }

      try {
        await octokit.repos.getContent({ owner, repo, path: "_config.yml" });
      } catch {
        if (pages?.buildType === "legacy") {
          issues.push({
            id: "missing-config",
            severity: "info",
            category: "Configuration",
            title: "No Jekyll Configuration",
            description: "No _config.yml file found. This is optional but recommended for Jekyll sites.",
            suggestedFix: "Create a _config.yml file with your site configuration",
            canAutoFix: true,
          });
        }
      }

      if (pages?.cname) {
        try {
          await octokit.repos.getContent({ owner, repo, path: "CNAME" });
        } catch {
          issues.push({
            id: "missing-cname-file",
            severity: "warning",
            category: "Configuration",
            title: "Missing CNAME File",
            description: `Custom domain ${pages.cname} is configured but no CNAME file exists in the repository.`,
            suggestedFix: "Create a CNAME file with your custom domain",
            canAutoFix: true,
          });
        }
      }

      const report: DiagnosticReport = {
        repository,
        pages,
        latestBuild,
        issues,
        siteReachable,
        lastChecked: new Date().toISOString(),
      };

      res.json(report);
    } catch (error: any) {
      console.error("Diagnose error:", error);
      res.status(500).json({ error: error.message || "Failed to diagnose repository" });
    }
  });

  app.post("/api/fix-issue", async (req: Request, res: Response) => {
    try {
      const parsed = fixIssueInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const { owner, repo, issueId } = parsed.data;

      const octokit = await getUncachableGitHubClient();
      const { data: repoData } = await octokit.repos.get({ owner, repo });
      const defaultBranch = repoData.default_branch;

      let message = "Issue fixed";
      
      switch (issueId) {
        case "missing-index": {
          const content = Buffer.from(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${repoData.name}</title>
</head>
<body>
  <h1>Welcome to ${repoData.name}</h1>
  <p>${repoData.description || 'Your GitHub Pages site is now live!'}</p>
</body>
</html>`).toString('base64');

          await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: "index.html",
            message: "Add index.html - Created by GitHub Pages Diagnostic Tool",
            content,
            branch: defaultBranch,
          });
          message = "Created index.html file";
          break;
        }

        case "missing-config": {
          const content = Buffer.from(`# Jekyll configuration
title: ${repoData.name}
description: ${repoData.description || 'A GitHub Pages site'}
theme: jekyll-theme-minimal
`).toString('base64');

          await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: "_config.yml",
            message: "Add _config.yml - Created by GitHub Pages Diagnostic Tool",
            content,
            branch: defaultBranch,
          });
          message = "Created _config.yml file";
          break;
        }

        case "missing-cname-file": {
          const { data: pagesData } = await octokit.repos.getPages({ owner, repo });
          if (pagesData.cname) {
            const content = Buffer.from(pagesData.cname).toString('base64');
            await octokit.repos.createOrUpdateFileContents({
              owner,
              repo,
              path: "CNAME",
              message: "Add CNAME file - Created by GitHub Pages Diagnostic Tool",
              content,
              branch: defaultBranch,
            });
            message = "Created CNAME file";
          }
          break;
        }

        default:
          return res.status(400).json({ error: "This issue cannot be auto-fixed" });
      }

      res.json({ success: true, message });
    } catch (error: any) {
      console.error("Fix issue error:", error);
      res.status(500).json({ error: error.message || "Failed to fix issue" });
    }
  });

  app.post("/api/fix-all", async (req: Request, res: Response) => {
    try {
      const parsed = repositoryInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const { owner, repo } = parsed.data;

      const fixableIssues = ["missing-index", "missing-config", "missing-cname-file"];
      const fixedIssues: string[] = [];

      for (const issueId of fixableIssues) {
        try {
          const response = await fetch(`http://localhost:${process.env.PORT || 5000}/api/fix-issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ owner, repo, issueId }),
          });
          if (response.ok) {
            fixedIssues.push(issueId);
          }
        } catch {
          // Skip issues that can't be fixed
        }
      }

      res.json({ 
        success: true, 
        message: `Fixed ${fixedIssues.length} issues`,
        fixedIssues,
      });
    } catch (error: any) {
      console.error("Fix all error:", error);
      res.status(500).json({ error: error.message || "Failed to fix issues" });
    }
  });

  app.post("/api/trigger-rebuild", async (req: Request, res: Response) => {
    try {
      const parsed = repositoryInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const { owner, repo } = parsed.data;

      const octokit = await getUncachableGitHubClient();
      
      await octokit.repos.requestPagesBuild({ owner, repo });
      
      res.json({ success: true, message: "Rebuild triggered successfully" });
    } catch (error: any) {
      console.error("Trigger rebuild error:", error);
      res.status(500).json({ error: error.message || "Failed to trigger rebuild" });
    }
  });

  return httpServer;
}
