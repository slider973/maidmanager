<!--
SYNC IMPACT REPORT
==================
Version change: 0.0.0 → 1.0.0 (MAJOR - initial constitution adoption)

Modified principles: N/A (initial version)

Added sections:
- Core Principles (7 principles)
- UI/UX Standards
- Database & Data Standards
- Performance Requirements
- Governance

Removed sections: N/A (initial version)

Templates requiring updates:
- .specify/templates/plan-template.md ✅ (compatible - Constitution Check section exists)
- .specify/templates/spec-template.md ✅ (compatible - requirements structure aligns)
- .specify/templates/tasks-template.md ✅ (compatible - testing workflow aligns)

Follow-up TODOs: None
==================
-->

# Maid Manager Constitution

A home maintenance tracking application built with SolidJS, TypeScript, and Supabase.

## Core Principles

### I. Type-Safe First

All code MUST be written in TypeScript with strict mode enabled. The `any` type is prohibited except in rare, documented edge cases (e.g., third-party library compatibility). Every function, component, and data structure MUST have explicit type annotations.

**Rationale**: Type safety catches errors at compile time, improves IDE support, and serves as living documentation. This reduces runtime bugs and accelerates development velocity.

**Requirements**:
- `strict: true` in tsconfig.json
- No implicit `any` allowed
- Supabase database types MUST be generated and used
- Props interfaces required for all components

### II. Test-Driven Development (TDD)

Tests MUST be written before implementation for all non-trivial features. The Red-Green-Refactor cycle is mandatory: write a failing test, implement minimal code to pass, then refactor.

**Rationale**: TDD ensures code meets requirements from the start, prevents regression, and produces naturally testable, modular code.

**Requirements**:
- Vitest is the mandated testing framework
- New features require at least one failing test before implementation
- Test files colocated with source: `*.test.ts` or `*.test.tsx`
- CI MUST run tests on every PR

### III. Ship Fast, Iterate Often

Favor working software over perfect architecture. Start with the simplest solution that works, then iterate based on real usage. Avoid premature abstraction and over-engineering.

**Rationale**: Fast iteration enables learning from real users. Complexity added speculatively often becomes technical debt when requirements change.

**Requirements**:
- MVP features delivered before polish
- No abstraction until pattern appears 3+ times
- YAGNI (You Aren't Gonna Need It) principle enforced
- Feature flags preferred over long-lived branches

### IV. Component-Based Architecture

UI MUST be built as small, reusable SolidJS components. Each component has a single responsibility. State is managed at the appropriate level - local when possible, context when shared.

**Rationale**: Small components are easier to test, reason about, and reuse. SolidJS's fine-grained reactivity works best with focused components.

**Requirements**:
- Components under 150 lines (excluding imports/types)
- Props drilling limited to 2 levels; use context beyond that
- Business logic extracted to hooks or services, not embedded in JSX
- Components named with PascalCase, files match component names

### V. Supabase-Native Patterns

All database operations MUST use Supabase client methods. Row Level Security (RLS) policies are mandatory for all tables. Direct SQL is allowed only in migrations.

**Rationale**: RLS provides defense-in-depth security. Supabase client methods provide type safety and integrate with auth automatically.

**Requirements**:
- Every table MUST have RLS enabled
- Auth checks via `supabase.auth.getUser()` before sensitive operations
- Realtime subscriptions preferred over polling for live data
- Migrations versioned and reviewed before deployment

### VI. Explicit Error Handling

All async operations MUST handle errors explicitly. User-facing errors MUST be translated to helpful messages. System errors MUST be logged with context.

**Rationale**: Unhandled errors create poor user experiences and are difficult to debug. Explicit handling makes failure modes visible and recoverable.

**Requirements**:
- No unhandled promise rejections
- Try-catch or `.catch()` on all async calls
- Error boundaries at route level minimum
- Errors logged with operation context (what, who, when)

### VII. Accessibility by Default

All interactive elements MUST be keyboard accessible. Semantic HTML is required. ARIA attributes used only when native semantics insufficient.

**Rationale**: Accessibility is a legal requirement in many jurisdictions and ensures all users can interact with the application.

**Requirements**:
- Buttons for actions, links for navigation
- Form inputs MUST have associated labels
- Focus management on route changes
- Color contrast MUST meet WCAG AA (4.5:1 for text)

## UI/UX Standards

Design and interaction patterns that ensure a consistent, high-quality user experience.

**Visual Consistency**:
- Design tokens (colors, spacing, typography) defined in CSS variables
- Component library patterns documented and reused
- Loading states for all async operations (skeleton or spinner)
- Empty states with clear calls-to-action

**Responsive Design**:
- Mobile-first CSS approach
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Touch targets minimum 44x44px on mobile
- No horizontal scroll on any supported viewport

**Feedback & Affordance**:
- Interactive elements MUST have hover/focus/active states
- Form validation inline, not just on submit
- Success/error toast notifications for async actions
- Optimistic UI updates where safe

## Database & Data Standards

Patterns for Supabase database design and data management.

**Schema Design**:
- Tables use snake_case naming
- Primary keys named `id` (UUID preferred)
- Timestamps: `created_at`, `updated_at` on all tables
- Soft delete via `deleted_at` when deletion is reversible

**RLS Policies**:
- Policies named descriptively: `users_select_own`, `tasks_insert_owner`
- Service role bypasses RLS only in Edge Functions, never client-side
- Policies tested explicitly in integration tests

**Migrations**:
- One migration per logical change
- Migrations MUST be reversible (provide down migration)
- No data manipulation in schema migrations; use separate data migrations
- Migration names: `YYYYMMDDHHMMSS_description.sql`

## Performance Requirements

Hard constraints ensuring fast, responsive user experience.

**Loading Performance**:
- Initial page load MUST complete in under 2 seconds (LCP)
- Time to Interactive (TTI) under 3 seconds
- First Contentful Paint (FCP) under 1 second

**Bundle Size**:
- Total JS bundle MUST be under 200KB (gzipped)
- Lazy loading required for routes not in critical path
- Tree-shaking verified; no dead code in production bundle

**Lighthouse Scores**:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+ (where applicable)

**Runtime Performance**:
- No layout shifts after initial paint (CLS < 0.1)
- 60fps for animations and transitions
- Database queries indexed appropriately; no N+1 queries

## Governance

The constitution supersedes all other development practices. Changes require deliberate review.

**Amendment Process**:
1. Propose change via PR with rationale
2. Review by at least one other contributor
3. Update version according to semantic versioning
4. Document change in sync impact report

**Versioning Policy**:
- MAJOR: Principle removed or fundamentally redefined
- MINOR: New principle added, section expanded materially
- PATCH: Clarifications, typos, non-semantic refinements

**Compliance**:
- PRs MUST verify alignment with constitution principles
- CI checks enforce measurable requirements (types, tests, lint)
- Code review includes constitution compliance verification
- Violations require explicit justification in PR description

**Version**: 1.0.0 | **Ratified**: 2026-02-05 | **Last Amended**: 2026-02-05
