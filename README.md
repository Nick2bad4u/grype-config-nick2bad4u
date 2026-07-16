# grype-config-nick2bad4u

[![CI](https://github.com/Nick2bad4u/grype-config-nick2bad4u/actions/workflows/ci.yml/badge.svg)](https://github.com/Nick2bad4u/grype-config-nick2bad4u/actions/workflows/ci.yml) [![npm](https://img.shields.io/npm/v/grype-config-nick2bad4u.svg)](https://www.npmjs.com/package/grype-config-nick2bad4u)

Portable shared [Grype](https://github.com/anchore/grype) vulnerability-scanning policies for local development and CI. The package contains policy files and typed path helpers; it does not install the external Grype CLI.

## Install

```sh
npm install --save-dev grype-config-nick2bad4u
```

Install Grype separately using an official distribution method, then point it at one bundled file:

```sh
grype dir:. -c node_modules/grype-config-nick2bad4u/.grype.yaml
```

## Presets

| Preset     | Failure threshold | Intended use                                      |
| ---------- | ----------------- | ------------------------------------------------- |
| `default`  | High              | Balanced local policy                             |
| `strict`   | Medium            | Stronger application gate                         |
| `maximum`  | Negligible        | Audit every severity                              |
| `critical` | Critical          | Minimal blocking gate                             |
| `ci`       | High              | SARIF report with mandatory database update check |
| `maven`    | High              | Balanced policy plus opt-in Maven network lookup  |

Alternative files live under `configs/`, for example:

```sh
grype dir:. -c node_modules/grype-config-nick2bad4u/configs/strict.yaml
```

The package deliberately contains no vulnerability ignores or broad filesystem exclusions. Add narrowly justified consumer policy in a second file; Grype applies later `-c` files after earlier ones:

```sh
grype dir:. \
  -c node_modules/grype-config-nick2bad4u/.grype.yaml \
  -c .grype.local.yaml
```

## Typed path API

```ts
import {
 getGrypeConfigPath,
 grypeConfigPaths,
 grypePresets,
 loadGrypeConfig,
} from "grype-config-nick2bad4u";

const strictPath = getGrypeConfigPath("strict");
const strictYaml = await loadGrypeConfig("strict");
```

`getGrypeConfigPath` returns an absolute package-owned path and throws for an unknown runtime value. This is preferable to a literal `node_modules` path under package managers with nonstandard layouts.

## CI example

```yaml
- name: Scan dependencies with Grype
  run: grype dir:. -c node_modules/grype-config-nick2bad4u/configs/ci.yaml
```

The CI preset writes `grype-results.sarif` in the consumer working directory. Registry credentials and VEX documents remain consumer-owned and should be supplied through Grype's documented environment or CLI interfaces.

## Development

```sh
npm install
npm run release:verify
```

The test suite validates every YAML policy, runtime path failures, absence of shared ignores, TLS settings, packed contents, and real `grype config --load` behavior when Grype is installed.
