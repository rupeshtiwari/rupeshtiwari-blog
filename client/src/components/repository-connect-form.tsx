import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { repositoryInputSchema, type RepositoryInput } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, Link2, Loader2 } from "lucide-react";

interface RepositoryConnectFormProps {
  onConnect: (data: RepositoryInput) => void;
  isLoading?: boolean;
  defaultOwner?: string;
  defaultRepo?: string;
}

export function RepositoryConnectForm({ 
  onConnect, 
  isLoading, 
  defaultOwner = "", 
  defaultRepo = "" 
}: RepositoryConnectFormProps) {
  const form = useForm<RepositoryInput>({
    resolver: zodResolver(repositoryInputSchema),
    defaultValues: {
      owner: defaultOwner,
      repo: defaultRepo,
    },
  });

  const handleSubmit = (data: RepositoryInput) => {
    onConnect(data);
  };

  const parseGitHubUrl = (url: string) => {
    const patterns = [
      /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/|$)/,
      /^([^/]+)\/([^/]+)$/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        form.setValue("owner", match[1]);
        form.setValue("repo", match[2].replace(/\.git$/, ""));
        return;
      }
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-primary/10">
            <GitBranch className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl">Connect Repository</CardTitle>
        </div>
        <CardDescription>
          Enter the GitHub repository details to diagnose your GitHub Pages site
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormLabel className="text-muted-foreground text-sm">Quick Import</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Paste GitHub URL or owner/repo"
                  onChange={(e) => parseGitHubUrl(e.target.value)}
                  data-testid="input-github-url"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    const url = (document.querySelector('[data-testid="input-github-url"]') as HTMLInputElement)?.value;
                    if (url) parseGitHubUrl(url);
                  }}
                  data-testid="button-parse-url"
                >
                  <Link2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="username" 
                        {...field} 
                        data-testid="input-owner"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="repo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repository</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="repository-name" 
                        {...field}
                        data-testid="input-repo" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              data-testid="button-connect"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <GitBranch className="mr-2 h-4 w-4" />
                  Connect & Diagnose
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
