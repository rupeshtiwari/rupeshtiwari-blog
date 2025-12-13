# GitHub Pages Diagnostic Tool - Design Guidelines

## Design Approach

**Selected System**: Material Design 3

**Justification**: This is a utility-focused diagnostic tool requiring clear information hierarchy, real-time status feedback, and efficient data presentation. Material Design 3 provides excellent patterns for status displays, progress indicators, and developer-focused interfaces while maintaining visual clarity.

**Key Principles**:
- Clarity over aesthetics: Information must be immediately scannable
- Progressive disclosure: Show critical issues first, details on demand
- Actionable feedback: Every status should guide the user to next steps
- Professional trust: Developer-grade polish with technical credibility

## Typography

**Font Stack**: 
- Interface: Roboto (via Google Fonts CDN)
- Code/Logs: Roboto Mono

**Hierarchy**:
- Page Title: text-3xl font-medium (Dashboard, Diagnostics, etc.)
- Section Headers: text-xl font-medium 
- Status Labels: text-sm font-semibold uppercase tracking-wide
- Body Text: text-base font-normal
- Error Messages: text-sm font-medium
- Code/URLs: font-mono text-sm
- Timestamps: text-xs font-normal

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8
- Component padding: p-6
- Section spacing: gap-6, mb-8
- Card padding: p-4
- Icon margins: mr-2
- Button padding: px-4 py-2

**Grid Structure**:
- Main container: max-w-7xl mx-auto px-4
- Dashboard: 3-column grid on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Status panels: 2-column on tablet (grid-cols-1 md:grid-cols-2)
- Log viewer: Single column full-width

## Component Library

### Navigation
**Top Bar**:
- Fixed header with app title "GitHub Pages Diagnostic Tool"
- GitHub repository name/link display
- Connection status indicator
- Refresh/Disconnect actions

### Dashboard Cards

**Health Status Card**:
- Large status icon (checkmark/warning/error) centered at top
- Primary status text (e.g., "Site is Down", "Deployment Successful")
- Timestamp of last check
- Quick action button (Diagnose, Fix, Rebuild)

**Repository Info Card**:
- Repository name as heading
- Visibility badge (Public/Private)
- Branch information
- Last commit details
- Direct GitHub link

**Deployment Status Card**:
- Build status with icon (success/failed/in-progress)
- Deployment progress bar if active
- Last deployment timestamp
- Link to Actions tab

**Quick Diagnostics Grid** (3 cards):
- Pages Configuration
- DNS/Domain Status  
- Build Errors Count

### Diagnostic Report Section

**Issue List**:
- Expandable accordion for each issue category
- Severity badges (Critical, Warning, Info)
- Issue title with count
- Detailed description when expanded
- Suggested fix actions

**Log Viewer**:
- Monospace font display area
- Syntax highlighting for error messages
- Line numbers
- Scroll-to-error functionality
- Copy log button

### Action Buttons

**Primary Actions**:
- Elevated buttons with shadow
- Icon + text labels (e.g., "Fix Issues", "Trigger Rebuild")
- Loading state with spinner

**Secondary Actions**:
- Text buttons for less critical actions
- View logs, Open repository, Documentation links

### Status Indicators

**Live Status Badge**:
- Circular pulse animation for "checking"
- Solid icons for stable states
- Positioned top-right of cards

**Progress Indicators**:
- Linear progress bars for deployments
- Circular spinners for API calls
- Percentage text for clarity

### Data Display

**Configuration Panel**:
- Key-value pairs in two-column layout
- Labels in subdued style
- Values in emphasized style
- Edit icons for configurable items

**Error Messages**:
- Alert boxes with appropriate severity styling
- Icon indicating error type
- Clear error message text
- Stack trace in collapsible section
- Suggested fix in highlighted box

### Forms

**Repository Connection**:
- Single input field for repository URL
- Connect button
- OAuth status indicator

**Configuration Editor**:
- YAML editor with syntax highlighting
- Line numbers
- Validation feedback inline
- Save/Cancel actions

## Icons

**Library**: Material Icons (via CDN)

**Usage**:
- check_circle: Success states
- error: Critical errors
- warning: Warnings
- info: Information
- refresh: Reload/rebuild actions
- settings: Configuration
- code: Repository/code related
- cloud_upload: Deployment
- bug_report: Diagnostics
- schedule: Timestamps

## Animations

**Minimal, Purposeful Only**:
- Pulse animation on "checking" status (1-2s loop)
- Smooth expand/collapse for accordions (200ms ease)
- Progress bar fill animation
- No decorative animations

## Layout Structure

**Main Dashboard**:
```
┌─────────────────────────────────────────┐
│ Header (Fixed)                          │
├─────────────────────────────────────────┤
│ Repository Status Banner                │
├─────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐             │
│ │Health│ │Deploy│ │ Info │ (3-col grid)│
│ └──────┘ └──────┘ └──────┘             │
├─────────────────────────────────────────┤
│ Diagnostic Results (Full width)         │
│ ┌─────────────────────────────────────┐ │
│ │ Issue Category 1 [Expand]           │ │
│ │ Issue Category 2 [Expand]           │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Build Logs (Full width, monospace)     │
└─────────────────────────────────────────┘
```

**Empty State** (no repository connected):
- Centered content (max-w-md)
- Illustration/icon at top
- Clear instruction text
- Connect repository form
- Help documentation link