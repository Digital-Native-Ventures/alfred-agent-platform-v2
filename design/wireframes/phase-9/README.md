# Phase 9 UI Wireframes

This directory contains wireframe designs and mockups for the Phase 9 UI implementation.

## Layout Structure

The new layout implements a clean, modern design with:

- **Sidebar Navigation**: Fixed left navigation with collapsible functionality
- **Top Bar**: Service health monitoring and user controls  
- **Main Content Area**: Flexible outlet for page content
- **Command Palette**: Overlay component for quick navigation (⌘K)

## Design Tokens

### Typography
- **Display Font**: Inter (primary interface font)
- **Font Family**: `font-display` utility class

### Brand Colors
- **Brand 50**: `#f0f7ff` (Light background)
- **Brand 500**: `#3874ff` (Primary brand color)  
- **Brand 700**: `#1d4ed8` (Dark accent)

### Background
- **Primary Background**: `bg-neutral-50` (Subtle warm neutral)

## Components

### Layout Components
- `Layout.tsx` - Main layout wrapper with Outlet pattern
- `Sidebar.tsx` - Navigation sidebar with health indicators  
- `Topbar.tsx` - Header with service monitoring and controls

### Interactive Elements
- Command palette with keyboard shortcuts
- Service health status indicators
- Quick action cards on dashboard
- Plan page with markdown rendering

## Implementation Notes

- Uses React Router v6 nested routing pattern
- Maintains all existing Phase 9 functionality
- Integrates with shadcn/ui component system
- Responsive design with Tailwind CSS utilities

Place exported wireframe images here for reference during development.