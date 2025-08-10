# Temu Referidos Colombia - Sistema de Cola

## Overview

This is a collaborative web application for sharing Temu referral codes in Colombia. The system implements a FIFO (First In, First Out) queue where users can submit their referral codes and each code gets 20 minutes of visibility before automatically rotating to the next one. The application features real-time updates via WebSockets, IP-based validation to prevent spam, and a responsive interface that works across all devices.

**Deployment Architecture**: Optimized for InfinityFree (frontend) + Render (backend + PostgreSQL) for completely free 24/7 hosting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Monorepo Structure
The application follows a clean monorepo architecture with clear separation of concerns:

- **Frontend**: Located in `/client` directory using React 18 with TypeScript
- **Backend**: Located in `/server` directory using Node.js with Express
- **Shared**: Common schemas and types in `/shared` directory
- **Configuration**: Multiple deployment configurations for different hosting platforms

### Frontend Architecture
- **React 18 with TypeScript** for type safety and modern React features
- **Tailwind CSS** for utility-first styling with **Shadcn UI** component library
- **React Query (@tanstack/react-query)** for server state management and caching
- **Wouter** for lightweight client-side routing
- **React Hook Form with Zod validation** for form handling and validation
- **WebSocket client** for real-time queue updates

### Backend Architecture
- **Express.js REST API** with TypeScript for type safety
- **WebSocket Server (ws)** for real-time bidirectional communication
- **Drizzle ORM** with PostgreSQL for database operations
- **Zod schemas** for request/response validation
- **IP-based rate limiting** to prevent spam (one code per IP address)
- **Automated queue management** with 20-minute timers

### Database Design
- **PostgreSQL** as the primary database with Neon serverless hosting support
- **Single queue_entries table** with columns for user data, queue position, timestamps, and status flags
- **UUID primary keys** for secure, non-sequential identifiers
- **Indexed fields** for efficient querying by IP address and position

### Real-Time Features
- **WebSocket connections** for instant queue updates across all clients
- **Automatic timer management** with 20-minute expiration per active code
- **Live status indicators** showing connection state and queue position
- **Automatic queue progression** when codes expire or are marked complete

### Deployment Architecture
The application is optimized for a hybrid deployment strategy:
- **Frontend**: Static hosting on InfinityFree (completely free)
- **Backend**: Render.com Web Service with PostgreSQL database (free tier)
- **WebSockets**: Real-time communication handled by Render backend
- **Build system**: Separate build processes for frontend (`build-frontend.sh`) and backend (`build-backend.sh`)
- **CORS**: Pre-configured for InfinityFree domains

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless database connectivity
- **drizzle-orm**: Type-safe database ORM with schema management
- **ws**: WebSocket server implementation for real-time communication
- **express**: Web framework for REST API endpoints
- **cors**: Cross-origin resource sharing middleware

### Frontend UI Dependencies
- **@radix-ui/react-***: Comprehensive component primitives for accessible UI
- **@tanstack/react-query**: Server state management and data fetching
- **tailwindcss**: Utility-first CSS framework
- **react-hook-form**: Performant form library with validation
- **wouter**: Minimalist routing for React applications

### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking and enhanced developer experience
- **esbuild**: Fast JavaScript bundler for production builds
- **drizzle-kit**: Database migration and schema management CLI

### Validation and Utilities
- **zod**: TypeScript-first schema declaration and validation
- **date-fns**: Modern JavaScript date utility library
- **clsx & tailwind-merge**: Utility functions for conditional CSS classes

### Hosting and Database Services
- **Neon**: Serverless PostgreSQL hosting with connection pooling
- **Render**: Cloud platform for backend API deployment
- **InfinityFree**: Free static hosting option for frontend deployment