# Tool Notification Audit

## Latest Fix (October 2025)
- Computed union of explicit mentions and auto-detected tools for fetching and display.
- Embedded notification in assistant message with table names footer.
- Removed separate ToolUsageNotification to prevent duplicates.
- Added comments to code to avoid recurrence in future refactors.

## History
- Multiple past issues with duplicate notifications from separate messages.
- Resolved by embedding and consistent tool computation.
