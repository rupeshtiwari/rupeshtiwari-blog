# GitHub Pages Diagnostic Tool

## Overview

A diagnostic utility for GitHub Pages deployments that helps users identify and resolve configuration problems, build errors, and deployment issues. The application connects to GitHub repositories via the GitHub API, runs automated diagnostics, and provides actionable feedback to fix detected issues.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Design System**: Material Design 3 principles for utility-focused interfaces with clear information hierarchy
- **Build Tool**: Vite with React plugin

The frontend follows a single-page application pattern with a dashboard-centric design. Components are organized into feature-specific components (health status, issue list, deployment status) and reusable UI primitives from shadcn/ui.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful JSON API under `/api/*` routes
- **GitHub Integration**: Octokit REST client for GitHub API interactions
- **Authentication**: Replit Connectors for GitHub OAuth token management (tokens auto-refresh)

Key API endpoints:
- `POST /api/connect` - Validates and connects to a GitHub repository
- `GET /api/diagnose` - Runs diagnostic checks on the connected repository
- `POST /api/fix` - Attempts automated fixes for detected issues

### Data Flow
1. User provides repository owner/name
2. Backend validates access via GitHub API
3. Diagnostic engine checks Pages configuration, build status, and common issues
4. Results displayed with severity levels (critical, warning, info)
5. Fix actions trigger GitHub API calls to resolve issues

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` for type-safe schemas shared between frontend and backend
- **Validation**: Zod schemas with drizzle-zod integration
- **Current Usage**: User storage is implemented with in-memory storage (`MemStorage` class) as a placeholder; database integration available via Drizzle

### Development vs Production
- Development uses Vite dev server with HMR
- Production serves pre-built static files from `dist/public`
- Build process uses esbuild for server bundling with selective dependency bundling for cold start optimization

## External Dependencies

### GitHub API Integration
- **Library**: @octokit/rest v22
- **Authentication**: OAuth via Replit Connectors (automatically handles token refresh)
- **Endpoints Used**: Repository info, Pages configuration, build status, workflow runs

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Connection**: Requires `DATABASE_URL` environment variable
- **Migrations**: Managed via `drizzle-kit push`

### UI Component Library
- **Framework**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod resolver

### Environment Requirements
- `DATABASE_URL` - PostgreSQL connection string
- `REPLIT_CONNECTORS_HOSTNAME` - For GitHub OAuth token retrieval
- `REPL_IDENTITY` or `WEB_REPL_RENEWAL` - Replit authentication tokens