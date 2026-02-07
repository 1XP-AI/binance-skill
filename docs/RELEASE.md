# Release Process (Binance Skill)

This repo publishes **public-only** Binance market data helpers (Spot + USDT-M Futures).

## Checklist

- Run tests: `npm test`
- Confirm CLI help: `node dist/cli.js help`
- Verify **User-Agent** header includes `binance-skill`
- Update `package.json` version if needed

## Publish

```bash
npm publish
```

## References

- Docs: https://1xp-ai.github.io/binance-skill/
- npm: https://www.npmjs.com/package/@1xp-ai/binance-skill
- Repo: https://github.com/1XP-AI/binance-skill
