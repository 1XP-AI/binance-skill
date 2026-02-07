# Error Mapping

This skill is public-only and does not maintain exchange-specific error code mappings. HTTP errors are surfaced as messages from Binance (when available) or as HTTP status errors.

## Notes

- Rate limits (HTTP 429/418) are handled with a simple backoff and retry.
- Other non-200 responses surface the `msg` field when provided by Binance.
