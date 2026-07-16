import { spawnSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

import {
    getGrypeConfigPath,
    grypeConfigPath,
    grypeConfigPaths,
    type GrypePreset,
    grypePresets,
    loadGrypeConfig,
} from "../src/grype-config.js";

describe("grype shared policy", () => {
    it.each(grypePresets)("loads the %s preset", async (preset) => {
        expect.assertions(4);

        const configPath = getGrypeConfigPath(preset);
        const source = await loadGrypeConfig(preset);
        const config = parse(source) as Record<string, unknown>;

        await access(configPath);

        expect(path.isAbsolute(configPath)).toBe(true);
        expect(configPath).toBe(grypeConfigPaths[preset]);
        expect(source.endsWith("\n")).toBe(true);
        expect(config["fail-on-severity"]).toBeTypeOf("string");
    });

    it("keeps the default path conventional", () => {
        expect.assertions(2);

        expect(grypeConfigPath).toBe(getGrypeConfigPath("default"));
        expect(path.basename(grypeConfigPath)).toBe(".grype.yaml");
    });

    it("rejects unknown presets at runtime", () => {
        expect.assertions(1);

        expect(() => getGrypeConfigPath("invented" as GrypePreset)).toThrow(
            RangeError
        );
    });

    it("ships no shared ignore policy or insecure registry transport", async () => {
        expect.hasAssertions();

        for (const preset of grypePresets) {
            const config = parse(
                await readFile(getGrypeConfigPath(preset), "utf8")
            ) as Record<string, unknown>;
            const registry = config["registry"] as Record<string, unknown>;

            expect(config).not.toHaveProperty("ignore");
            expect(config).not.toHaveProperty("exclude");
            expect(registry["insecure-skip-tls-verify"]).toBe(false);
            expect(registry["insecure-use-http"]).toBe(false);
        }
    });

    it.runIf(spawnSync("grype", ["version"]).status === 0)(
        "loads every preset with the real Grype CLI",
        () => {
            expect.hasAssertions();

            for (const preset of grypePresets) {
                const result = spawnSync(
                    "grype",
                    [
                        "config",
                        "--load",
                        "-c",
                        getGrypeConfigPath(preset),
                    ],
                    { encoding: "utf8" }
                );

                expect(result.status).toBe(0);
            }
        },
        60_000
    );
});
