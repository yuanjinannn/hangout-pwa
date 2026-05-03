# Publishing Checklist

Before making the repository public:

- Confirm `git grep -n "<known-key-fragment>" $(git rev-list --all)` returns no results.
- Confirm no real `.env` file is tracked.
- Keep `AMAP_KEY` only in local shell variables or deployment secret settings.
- Run `.\scripts\smoke-ui.cmd` without `AMAP_KEY`; it should pass using local recommendations.
- Optionally run the smoke test again with `AMAP_KEY` configured to verify live POI import.
- Check the mobile UI at 320px and 390px widths.
- Rotate any API key that may have existed in local history before this cleanup.

Public demo expectations:

- This is a frontend/PWA prototype, not a production social platform.
- Demo users, phone numbers, places, and activities are synthetic.
- There is no real account system, SMS verification, server database, or moderation dashboard yet.
