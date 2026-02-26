# Cosmetic Store

## Current State
The app has user login via Internet Identity, a profile panel (ProfileSheet) where users can set/update their display name, a wishlist, and admin product management. The backend uses an access control system where users must be registered via `_initializeAccessControlWithSecret` before they can call protected endpoints like `saveCallerUserProfile` and `getCallerUserProfile`.

## Requested Changes (Diff)

### Add
- Nothing new to add

### Modify
- Fix the profile name save issue: when a logged-in user opens the profile and tries to save their name, it fails because the access control `hasPermission` check traps with "User is not registered". The backend's `saveCallerUserProfile` and `getCallerUserProfile` both require `#user` permission, but a user must first be registered via `_initializeAccessControlWithSecret`. The `useActor` hook does call this, but there may be a race or the save attempt uses the wrong actor instance.
- The backend `getCallerUserProfile` and `saveCallerUserProfile` should handle unregistered users gracefully -- auto-register them as `#user` if they're not anonymous, instead of trapping.
- Alternatively, ensure that `_initializeAccessControlWithSecret` is always awaited before the actor resolves and is used for mutations.

### Remove
- Nothing to remove

## Implementation Plan
1. Fix the backend: modify `getCallerUserProfile` and `saveCallerUserProfile` to auto-register the caller as `#user` if they are not already registered and not anonymous, rather than trapping "User is not registered".
2. Alternatively (simpler), fix `access-control.mo`'s `hasPermission` to auto-register unregistered non-anonymous callers as `#user` instead of trapping.
3. Verify frontend mutation flow is correct and uses authenticated actor.

## UX Notes
- Profile name save should succeed silently for any logged-in user
- Error message "Failed to save profile" should not appear for normal usage
