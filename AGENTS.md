# AGENTS.md

Development guidelines and instructions for AI agents working on this project.

## Project Overview

**Waffice-Web** is an internal management web application for Waffle Studio (와플 스튜디오). This Next.js 15 frontend application provides comprehensive administration features for:
- Member management
- Project tracking

## Technology Stack

- **Framework**: Next.js 15.5.3 with App Router and Turbopack
- **Runtime**: React 19.1.0, React DOM 19.1.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4, Radix UI components
- **Forms**: react-hook-form + Zod validation
- **Data Management**: @tanstack/react-query
- **Code Quality**: Biomejs 2.2.6 (linter + formatter)
- **Package Manager**: pnpm

## Development Workflow

### Before Making Changes

1. **Understand the codebase structure**:
   - `/src/app` - Next.js pages with App Router
   - `/src/components` - Reusable React components (layout, ui, domain-specific)
   - `/src/lib` - Utility functions and API client
   - `/src/types` - TypeScript type definitions
   - `openapi.json` - Backend API specification

2. **Check API integration**:
   - Review `openapi.json` for available endpoints
   - Update `src/lib/api.ts` when adding new API calls
   - Add corresponding types in `src/types/index.ts`

### Making Changes

1. **Follow existing patterns**:
   - Use React Hook Form + Zod for forms
   - Use React Query for data fetching
   - Follow shadcn/ui component patterns in `/src/components/ui`
   - Use Tailwind CSS for styling (no custom CSS unless necessary)

2. **Type safety**:
   - Always define TypeScript interfaces for new data structures
   - Keep types in `/src/types/index.ts`
   - Avoid using `any` type

3. **Component structure**:
   - Prefer server components (default in Next.js App Router)
   - Use `"use client"` directive only when necessary (hooks, interactivity)
   - Keep components focused and single-purpose

### Before Committing - CRITICAL

**ALWAYS run the following checks before creating a commit:**

```bash
# 1. Check code formatting
pnpm run format:check

# 2. Run linting
pnpm run lint

# 3. Fix auto-fixable issues
pnpm run lint:fix

# 4. Build the project to ensure no errors
pnpm run build
```

**All checks must pass before committing.** This ensures:
- Code quality standards are met
- No TypeScript compilation errors
- No linting violations
- Production build succeeds

### Commit Guidelines

1. **Run CI checks first** (see above)
2. **Write descriptive commit messages**:
   - Use imperative mood ("Add feature" not "Added feature")
   - Include context about what changed and why
   - Reference related issues if applicable

3. **Commit message format**:
   ```
   Brief summary (50 chars or less)

   Detailed explanation of changes:
   - What was changed
   - Why it was changed
   - Any important implementation details

   Build and format checks pass successfully.
   ```

### CI/CD Pipeline

The project uses GitHub Actions with the following checks:

1. **Format Check** (`pnpm run format:check`)
2. **Linting** (`pnpm run lint`)
3. **Build** (`pnpm run build`)

**Location**: `.github/workflows/ci.yml`

All pull requests and pushes to `main` trigger these checks. Ensure they pass locally before pushing.

## API Integration

### OpenAPI Specification

The backend API is defined in `openapi.json`. When the backend team updates this file:

1. Review new endpoints and schemas
2. Update `src/lib/api.ts` to implement new endpoints
3. Add/update types in `src/types/index.ts` based on schemas
4. Update existing components to use new endpoints
5. Mark legacy endpoints with `console.warn()` if they're placeholders

### Current API Status

- **Implemented**: User management, User history
- **Pending**: Member, Project APIs
  - These use mock endpoints with warnings
  - Will be replaced when added to OpenAPI spec

## Common Tasks

### Adding a New Page

1. Create page in `/src/app/[route]/page.tsx`
2. Add navigation item in `/src/components/layout/navigation.tsx`
3. Create domain components in `/src/components/[domain]/`
4. Add required API methods in `/src/lib/api.ts`
5. Define types in `/src/types/index.ts`

### Adding a New Component

1. For UI primitives: `/src/components/ui/[component].tsx`
2. For domain components: `/src/components/[domain]/[component].tsx`
3. Use TypeScript interfaces for props
4. Follow existing component patterns (form, table, etc.)

### Adding API Endpoints

1. Check `openapi.json` for endpoint specification
2. Add method to `ApiClient` class in `/src/lib/api.ts`
3. Define request/response types in `/src/types/index.ts`
4. Use consistent error handling pattern
5. Update components to use new endpoints

## Code Style Guidelines

### TypeScript

- Use `interface` for object shapes
- Use `type` for unions, primitives, and utility types
- Enable strict mode (already configured)
- Avoid `any` - use `unknown` or proper types

### React

- Functional components only
- Use hooks for state and side effects
- Prefer composition over inheritance
- Keep components small and focused

### Styling

- Use Tailwind utility classes
- Follow existing color scheme (CSS variables)
- Use `cn()` utility for conditional classes
- Maintain responsive design patterns

### Forms

- Always use react-hook-form + Zod validation
- Define schema with clear error messages
- Handle loading and error states
- Provide user feedback on submission

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: `http://localhost:8000`)

Create `.env.local` for local development overrides.

## Common Issues & Solutions

### Build Errors

- Run `pnpm install` to ensure dependencies are up to date
- Clear `.next` folder and rebuild
- Check for TypeScript errors in editor

### Linting Errors

- Run `pnpm run lint:fix` for auto-fixable issues
- Review and manually fix remaining issues
- Some warnings are acceptable (document why)

### API Integration Issues

- Verify backend is running and accessible
- Check CORS configuration
- Verify endpoint paths match `openapi.json`
- Check network tab in browser DevTools

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
- [Biomejs Documentation](https://biomejs.dev/guides/getting-started/)

## Notes for AI Agents

1. **Always read existing code** before making changes to understand patterns
2. **Run checks before committing** - this is non-negotiable
3. **Ask for clarification** if requirements are ambiguous
4. **Maintain consistency** with existing code style
5. **Document complex logic** with comments
6. **Test changes locally** before committing
7. **Follow the OpenAPI spec** as the source of truth for API integration
