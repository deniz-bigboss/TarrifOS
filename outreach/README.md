# Outreach reports

The sales motion is: classify one of a prospect's real products, send them the
report. `npm run outreach` does that for a whole list.

## Use

1. Create an API key: **Dashboard → API keys**.
2. Copy `prospects.example.csv` to `prospects.csv` and fill it in. Only
   `company` and `product_name` are required; the more product detail you give,
   the higher the confidence and the more useful the report.
3. Run it:

   ```bash
   KUSTARO_API_KEY=kustaro_sk_... npm run outreach
   # preview without spending credits:
   KUSTARO_API_KEY=... npm run outreach -- --dry-run
   # first 10 rows, Turkish drafts:
   KUSTARO_API_KEY=... npm run outreach -- --limit 10 --lang tr
   ```

Each row costs one classification credit. Rows that already have a report are
skipped, so re-running is safe.

## Output

- `reports/<company>-<product>.md` — the report to send (print to PDF)
- `drafts/<company>-<product>.txt` — the message, code and readiness score filled in
- `tracking.csv` — one line per prospect; mark the `sent` column yourself

Set `destination` to **US** or **GB** wherever you can: those are the two lanes
where the duty rate comes from a live official source (USITC HTS, UK Trade
Tariff). Elsewhere the report falls back to reference data and says so.

## Sending

Do **not** bulk-send these from `kustaro.app` through Resend. That domain sends
your signup confirmations and password resets — cold volume on it risks the
deliverability the product depends on, and transactional providers prohibit
unsolicited outreach. Use a separate domain with a tool built for outreach, keep
it under ~40/day, always include a way to opt out — or send via LinkedIn, which
has no deliverability risk at all.
