# Job details with application tracking

## What will change
- Add a job details page, opened by clicking a job title or a **View details** link in the feed.
- Show the available job information: title, company, location, salary, work mode, job type, summary, requirements, eligibility and posted date, plus the existing fresher verification badge.
- Include **Save job**, an application status selector and personal notes on that page.
- Keep **Apply Now** opening the employer’s listing. Opening that link will not automatically mark the job as Applied.

## Tracking behavior
- Reuse your existing tracker rather than create a second one.
- Status choices: **Saved**, **Applied**, **Interviewing**, **Offer** and **Rejected**. Offer and Rejected remain grouped under Result in your tracker.
- Saving creates one entry per role. Choosing a status for an unsaved job saves it with that status.
- Show the current status consistently in the feed, job details and My Application Tracker.
- Allow users to remove a job from their tracker from its details page.
- Keep a saved copy of the listing so users can still open its details if it disappears from the live feed.

## Persistence and boundaries
- Continue saving jobs, statuses and notes on the current device, matching the existing tracker. No sign-in is required, and this change does not add cross-device account syncing.
- Use live listings only and preserve the strict 0–1 year experience filter.
- Show a clear unavailable state if a details link has neither a current live listing nor a saved copy.
- Preserve the existing light/dark appearance and make the details and status controls fit smaller screens.

## Technical approach
- Add a public `/jobs/$jobId` page with job-specific title and sharing metadata.
- Resolve jobs from the existing filtered feed, with the tracker snapshot as a client-side fallback after local storage is ready.
- Share the status choices and tracking controls between the details page and tracker where appropriate, using the existing app state and pure tracker transitions.
- Link tracker entries to the new details page while retaining their external listing link.
- Do not change job providers, API search limits, authentication or database storage.

## Verification
- Add and run focused tests for saving without duplicates, setting a status on an unsaved role, status transitions and removal.
- Check the full browser flow with a real live role: open details, save, change status, add a note, confirm it in the tracker and reload to verify persistence.
- Check saved listing fallback, unavailable links, and desktop/mobile layouts.

## Approval
After you approve, I’ll build this connection between job details and your existing tracker.