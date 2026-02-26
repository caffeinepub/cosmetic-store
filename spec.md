# Cosmetic Store

## Current State
- Full product catalog with category filters, search, and price sort
- Internet Identity login/logout
- Profile setup dialog (shown once after first login, collects user's name)
- Name displayed in header when logged in
- Admin panel for product management (admin-only)
- Backend supports `getCallerUserProfile`, `saveCallerUserProfile`, `getUserProfile`

## Requested Changes (Diff)

### Add
- Profile dropdown/sheet accessible from the header when user is logged in
- Inside the profile panel: display user's name, allow editing and saving the name
- Show user role (admin or member)

### Modify
- Replace the plain name text in the header with a clickable profile button (user icon + name)
- Profile setup dialog still shown on first login if no profile exists

### Remove
- Nothing removed

## Implementation Plan
1. Add a profile icon button in the header (replaces the static name display)
2. Create a `ProfileSheet` component (slide-in panel) with:
   - Avatar/icon display
   - Editable name field (pre-filled with current name)
   - Save button
   - User role badge (Admin / Member)
3. Wire up `useSaveCallerUserProfile` mutation for saving changes
4. Invalidate/refetch profile query on save success

## UX Notes
- Profile button only visible when authenticated
- Sheet slides in from the right
- Inline success/error feedback on save
- Keep existing ProfileSetupDialog for first-time users
