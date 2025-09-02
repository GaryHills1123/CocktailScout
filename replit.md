# CafeScout - Hamilton Coffee Map

## Overview

CafeScout is a coffee shop discovery application focused on Hamilton, Ontario. It combines an interactive map view with a searchable list to help users find the best coffee spots based on a calculated "vibe score". The application ranks cafés using a proprietary algorithm that considers ratings, review counts, price fairness, and coffee-specific keywords to create a 0-100 vibe score.

The application is built as a full-stack TypeScript project with a React frontend and Express backend, featuring a clean, coffee-themed UI design with warm color palettes and friendly typography.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Library**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS with custom design tokens for coffee-themed aesthetics
- **Component System**: Shadcn/ui components with "new-york" style variant

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for café data operations
- **Data Storage**: In-memory storage with seeded café data (development/demo)
- **Business Logic**: Custom vibe score calculation algorithm

### Data Storage Solutions
- **Development**: MemStorage class with in-memory café data
- **Production Ready**: Drizzle ORM configured for PostgreSQL
- **Database Schema**: Cafés table with comprehensive location, rating, and metadata fields
- **External Data**: Designed to integrate with Yelp API for real café data

### Key Features
- **Interactive Map**: Leaflet.js integration for geographic café visualization
- **Search & Filter**: Real-time café search with category filters
- **Responsive Design**: Mobile-first approach with adaptive UI components
- **Vibe Score Algorithm**: Proprietary scoring system combining multiple café quality factors

### External Dependencies
- **Maps**: Leaflet.js for interactive map functionality
- **Database**: Neon Database (serverless PostgreSQL) via @neondatabase/serverless
- **Potential APIs**: Yelp API integration capability for live café data
- **Styling**: Google Fonts integration for typography (Architects Daughter, DM Sans, Fira Code, Geist Mono)
- **Development**: Replit-specific tooling for cloud development environment

### Development Environment
- **Platform**: Optimized for Replit with specific plugins and configurations
- **Hot Reload**: Vite HMR for rapid frontend development
- **Type Safety**: Comprehensive TypeScript configuration across client/server/shared code
- **Path Aliases**: Configured import paths for clean code organization
- **Build Process**: Separate client (Vite) and server (esbuild) build pipelines