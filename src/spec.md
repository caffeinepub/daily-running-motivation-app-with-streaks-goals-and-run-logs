# Specification

## Summary
**Goal:** Build a daily running motivation app with authenticated (Internet Identity) user data, guest exploration mode, run logging, streaks, achievements, reminders, and a consistent visual theme.

**Planned changes:**
- Add Internet Identity sign-in/out; scope all stored data to the authenticated principal and provide a limited guest mode that cannot persist data.
- Implement a single Motoko backend actor data model + API for profile (optional display name), goal settings (number + unit), run logs (date, duration, optional distance, notes), computed streak, and achievements/badges.
- Create core frontend screens and navigation: Dashboard, Log a Run, History (list/detail), and Settings (goal + reminder preferences).
- Add a motivation system on the Dashboard: daily motivational message, progress feedback toward today’s goal, and celebratory UI when completing today or extending a streak.
- Define and display at least 5 achievements with clear unlock conditions; highlight newly unlocked achievements and show earned vs locked.
- Implement in-app reminder UX (no push): reminder time + enable toggle; show a banner after the chosen local time if today isn’t completed.
- Apply a distinct, coherent visual theme (not default-looking; avoid blue+purple as primary palette) and ensure responsive mobile usability.
- Add validation and safety: client-side input validation + duplicate-submission prevention; backend validation and user-friendly error handling with retry guidance.

**User-visible outcome:** Users can sign in with Internet Identity (or explore in guest mode), set a daily goal and reminder, log runs, view history, see daily motivation and progress, track streaks, unlock/view achievements, and get celebratory feedback and reminder banners—all within a consistently themed, mobile-friendly UI.
