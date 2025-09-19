# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

For supabase deployment always use remote supabase 

## Database Access & Connection Methods
**CRITICAL**: This section provides definitive guidance for all database operations.

### 🔍 **Current Connection Status (Verified 2025-09-19)**
- ✅ **Supabase CLI v2.40.7**: Latest version, full authentication and deployment capabilities
- ✅ **Migration History**: Fully synchronized with remote database
- ✅ **Function Deployment**: Tested and working via CLI
- ✅ **Dashboard SQL Editor**: Direct web access for immediate SQL execution  
- ✅ **Edge Functions**: HTTP API and programmatic deployment working
- ✅ **HTTP REST/RPC**: Direct API calls with service role authentication
- ❌ **Legacy psql commands**: Hardcoded credentials throughout codebase are obsolete
- ⚠️  **Direct psql**: Possible with proper authentication setup (see advanced section)

### 🚀 Quick Setup
Before any database operations, run these setup commands:
```bash
./setup-supabase-auth.sh      # Set up authentication (run once)
source .env.supabase          # Load environment variables (each session)
./verify-supabase-connection.sh  # Verify all connections work
```

### 🎯 Primary Method: Supabase CLI (Recommended) ✅
**Best for**: Migrations, schema changes, function deployment  
**Status**: Fully working with proper authentication
```bash
# Essential Commands
npx supabase db push --linked          # Deploy migrations to remote
npx supabase migration new [name]      # Create new migration
npx supabase migration list           # Check migration status
npx supabase functions deploy [name] --project-ref cgvjcsevidvxabtwdkdv
npx supabase projects list           # Verify authentication

# Authentication Setup (if needed)
source .env.supabase  # Load credentials
export SUPABASE_ACCESS_TOKEN="your-token"  # Alternative method
```

**✅ Advantages**: Handles authentication automatically, supports all operations, migration tracking
**❌ Limitations**: Requires proper environment setup

### 🌐 Fallback Method: Supabase Dashboard SQL Editor ✅
**Best for**: Quick fixes, emergency deployments, complex SQL debugging  
**Status**: Always available, no setup required
1. Go to: https://supabase.com/dashboard/project/cgvjcsevidvxabtwdkdv
2. Click "SQL Editor" in sidebar
3. Paste SQL and click "Run"

**✅ Advantages**: Always works, no local setup needed, immediate execution
**❌ Limitations**: No migration tracking, manual process

### ⚡ Emergency Method: Edge Functions ✅
**Best for**: When CLI fails and Dashboard is unavailable  
**Status**: HTTP API calls working with proper authentication
```bash
npx supabase functions deploy deploy-fix --project-ref cgvjcsevidvxabtwdkdv
curl -X POST "https://cgvjcsevidvxabtwdkdv.supabase.co/functions/v1/deploy-fix" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]"
```

**✅ Advantages**: Programmatic, can handle complex operations
**❌ Limitations**: Requires edge function setup, more complex

### 🚫 What to Avoid
- **Hardcoded psql credentials**: Outdated hardcoded passwords (like `PGPASSWORD="Rclth2024"`) will fail
- **Local Supabase**: This project uses remote-only configuration
- **Hardcoded connection strings**: Use environment variables only
- **Unauthenticated direct connections**: Always use proper authentication methods

### 🔧 Troubleshooting Database Connections

#### Migration Conflicts
**Problem**: "Migration already exists" or "duplicate key" errors
**Solution**:
```bash
./fix-migration-conflicts.sh  # Automated conflict resolution
# OR manually:
npx supabase migration repair --status reverted
npx supabase db push --linked
```

#### Authentication Issues
**Problem**: "Cannot use automatic login flow" or "No such container"
**Solution**:
```bash
source .env.supabase  # Load environment variables
./verify-supabase-connection.sh  # Diagnose issues
# Check if SUPABASE_ACCESS_TOKEN is set
```

#### Function Not Found Errors
**Problem**: "function does not exist" or "not unique"
**Solution**: Use the Dashboard SQL Editor method as fallback:
1. Drop all function versions: `DROP FUNCTION IF EXISTS function_name(...);`
2. Recreate with clean signature
3. Test immediately in same editor

### 📋 Connection Decision Tree
```
Need to make database changes?
├── Is it a migration? 
│   ├── Yes → Use Supabase CLI (`npx supabase db push --linked`)
│   └── No → Continue below
├── Is CLI working?
│   ├── Yes → Use Supabase CLI
│   ├── No → Check authentication with `./verify-supabase-connection.sh`
│   └── Still failing → Use Dashboard SQL Editor
├── Is it an emergency?
│   ├── Yes → Use Dashboard SQL Editor (fastest)
│   └── No → Troubleshoot CLI connection
└── Need programmatic deployment?
    └── Use Edge Functions method
```

### 🛡️ Migration Best Practices
1. **Always backup before major changes**: Migrations create automatic backups
2. **Test locally first**: Use `./verify-supabase-connection.sh` 
3. **Clean migration history**: Run `./fix-migration-conflicts.sh` if needed
4. **Validate after deployment**: Check function with test queries
5. **Document changes**: Include clear comments in migration files

### 🔐 Direct Database Access (Advanced Users Only)
**Best for**: Complex SQL operations requiring direct PostgreSQL access

If you need direct psql access, use proper authentication:
```bash
# Option 1: Use Supabase CLI to get temporary connection string
npx supabase db show-connection-string --linked

# Option 2: Set up proper environment-based authentication
# (Never use hardcoded passwords like the old "Rclth2024")
export PGPASSWORD="$(npx supabase secrets list | grep DB_PASSWORD)"
psql "$(npx supabase db show-connection-string --linked)"
```

**⚠️ Important**: The old hardcoded `PGPASSWORD="Rclth2024"` commands throughout the codebase are **obsolete and will fail**. Always use CLI-generated connection strings.

### 📋 **Quick CLI Reference (Updated 2025-09-19)**

#### Migration Operations
```bash
# Check migration status
npx supabase migration list

# Create new migration
npx supabase migration new migration_name

# Deploy migrations to remote (if new migrations exist)
npx supabase db push --linked

# Repair migration history (mark manually deployed migrations as applied)
npx supabase migration repair [version1] [version2] --status applied --linked
```

#### Function Deployment
```bash
# Deploy single function
npx supabase functions deploy function-name --project-ref cgvjcsevidvxabtwdkdv

# Deploy all functions
npx supabase functions deploy --project-ref cgvjcsevidvxabtwdkdv

# List deployed functions
npx supabase functions list

# View function logs
npx supabase functions logs function-name --project-ref cgvjcsevidvxabtwdkdv
```

#### General CLI Operations
```bash
# Check CLI version
npx supabase --version

# Verify authentication and project linking
npx supabase projects list

# Update CLI (via Homebrew)
brew upgrade supabase/tap/supabase
```

### 🧹 **Legacy Code Cleanup Status**
- ✅ **CLAUDE.md**: Updated with correct connection methods (2025-09-19)
- ✅ **Supabase CLI**: Updated to v2.40.7 with full remote capabilities
- ✅ **Migration History**: Synchronized with remote database
- ✅ **Function Deployment**: Tested and working via CLI
- ✅ **directPostgresConnection.ts**: Fixed hardcoded credentials, now uses environment variables
- ⚠️  **Remaining codebase**: May contain legacy psql commands that need credential updates
- 📝 **Recommendation**: Use Supabase CLI and Dashboard methods documented above instead of direct psql

### 📊 Environment Variables Reference
```bash
# Required for CLI authentication
SUPABASE_ACCESS_TOKEN=sbp_...        # Personal access token
SUPABASE_PROJECT_REF=cgvjcsevidvxabtwdkdv
SUPABASE_URL=https://cgvjcsevidvxabtwdkdv.supabase.co

# For JavaScript client operations  
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

##SUPABASE CREDENTIALS
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndmpjc2V2aWR2eGFidHdka2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1Nzg5MTcsImV4cCI6MjA1OTE1NDkxN30.r8BQC5nOWdbvwcg2k0MD1OVn8JoNtr7TCpKwuYBDAEc
SERVICE ROLE KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndmpjc2V2aWR2eGFidHdka2R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzU3ODkxNywiZXhwIjoyMDU5MTU0OTE3fQ.YOW5LOXlenisyCSsCCFJI5o6msCXmbGZyl1X5wEVyQg
PROJECT ID=cgvjcsevidvxabtwdkdv 




## Development Commands

**Core Development**:
- `npm run dev` - Start development server (port 8080)
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

**Working Directory**: Always work in `/rclth-pulse-v2/` subdirectory, not the root.

## Architecture Overview

This is a comprehensive React-based business management application built with:

**Core Stack**:
- React 18.3 with TypeScript and Vite
- Supabase (PostgreSQL) for backend and authentication
- TailwindCSS with shadcn/ui component system
- Zustand for global state management
- React Hook Form + Zod for form validation

**Key Architectural Patterns**:

### Authentication & Authorization
- **AuthStore** (`src/stores/authStore.ts`): Zustand store managing user sessions, profiles, and admin roles
- **ProtectedRoute** component: Route-level authentication guards
- **Admin Detection**: Hardcoded admin emails + database role verification
- Session management with automatic refresh and network error handling

### State Management
- **Zustand Stores**: Global state in `src/stores/` (auth, notifications)
- **Custom Hooks**: Domain-specific hooks in `src/hooks/` following `use[Domain][Action]` naming
- **Data Fetching**: Hooks handle Supabase queries with loading/error states

### Component Organization
- **UI Components**: `src/components/ui/` (shadcn/ui base components)
- **Feature Components**: Domain-organized (`src/components/crm/`, `src/components/admin/`, etc.)
- **Service Layer**: `src/services/[domain]/` with modular structure (core, email, PDF, documents)
- **Type System**: `src/types/` with domain-specific interfaces

### Routing & Navigation
- Modular route files (`src/routes/[domain]Routes.tsx`)
- Central route configuration in `src/routes/index.tsx`
- ProtectedRoute wrapper with admin-level protection

## Code Conventions

**File Naming**:
- Components: PascalCase
- Hooks: camelCase with `use` prefix
- Services: camelCase with descriptive suffixes
- Types: PascalCase interfaces

**Import Patterns**:
- Use `@/` alias for `src/` imports
- Barrel exports (`index.ts`) for clean imports
- Domain-driven folder structure

**State Management**:
- Zustand stores for global state
- Custom hooks for component-level state and data fetching
- React Hook Form + Zod for form state and validation

## Supabase Integration

**Database**:
- Typed client in `src/integrations/supabase/client.ts`
- Auto-generated types with custom extensions
- Row Level Security (RLS) enforced at database level
- Real-time subscriptions for notifications

**Edge Functions**: Located in `supabase/functions/` for:
- Email notifications
- AI research integrations
- SQL execution
- Document processing

## Theme System

**Advanced Theming**:
- Custom theme system beyond standard dark/light
- Theme persistence in localStorage
- Document attribute and class-based theming
- Smooth transitions with animation support
- Custom color palettes (crimson, wedgewood, eucalyptus)

## Key Dependencies

**Critical Libraries**:
- `@supabase/supabase-js`: Database and auth
- `zustand`: State management
- `@radix-ui/*`: UI primitives
- `react-hook-form` + `zod`: Forms and validation
- `lucide-react`: Icons
- `sonner`: Toast notifications
- `next-themes`: Theme management

## Development Patterns

**Error Handling**:
- Comprehensive try-catch in async operations
- Network error detection with user feedback
- Loading states for all async operations
- Toast notifications for user feedback

**Performance**:
- React Query for data fetching with 5-minute stale time
- Optimized Vite build with manual chunks for TipTap/ProseMirror
- Lazy loading and code splitting for large components

**Type Safety**:
- Strict TypeScript configuration
- Zod schemas for runtime validation
- Typed Supabase operations
- Interface definitions for all service responses

## Important Notes

- The application handles complex business workflows (CRM, procurement, reporting, etc.)
- Real-time notifications system with modular store architecture
- Admin-only features protected at multiple levels
- Extensive use of modals and form dialogs for data entry
- PDF generation and email notifications throughout workflows
