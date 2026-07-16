# Repository Instructions

This repository publishes `grype-config-nick2bad4u`. Treat `.grype.yaml`, every file under `configs/`, and the typed preset-path API as public package surfaces.

## Priorities

- Keep scanner credentials, consumer names, absolute cache paths, vulnerability ignores, and broad scan exclusions out of shared policy.
- Preserve TLS verification and database age/hash validation.
- Keep config files directly consumable from `node_modules`.
- Validate every preset with `grype config --load` when Grype is available.
- This package supplies configuration only; it must not claim to install Grype.

## Commands

```sh
npm run build:runtime
npm run typecheck
npm test
npm run release:verify
```
