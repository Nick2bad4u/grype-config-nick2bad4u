import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

/** Supported Grype policy presets. */
export type GrypePreset =
    | "ci"
    | "critical"
    | "default"
    | "maven"
    | "maximum"
    | "strict";

/** All bundled Grype policy preset names. */
export const grypePresets: readonly GrypePreset[] = Object.freeze([
    "default",
    "strict",
    "maximum",
    "critical",
    "ci",
    "maven",
]);

const paths: Readonly<Record<GrypePreset, string>> = Object.freeze({
    ci: fileURLToPath(new URL("../configs/ci.yaml", import.meta.url)),
    critical: fileURLToPath(
        new URL("../configs/critical.yaml", import.meta.url)
    ),
    default: fileURLToPath(new URL("../.grype.yaml", import.meta.url)),
    maven: fileURLToPath(new URL("../configs/maven.yaml", import.meta.url)),
    maximum: fileURLToPath(new URL("../configs/maximum.yaml", import.meta.url)),
    strict: fileURLToPath(new URL("../configs/strict.yaml", import.meta.url)),
});

/** Absolute path to the backwards-compatible default `.grype.yaml`. */
export const grypeConfigPath: string = paths.default;

/** Immutable mapping from preset names to package-owned absolute paths. */
export const grypeConfigPaths: Readonly<Record<GrypePreset, string>> = paths;

/**
 * Resolve one bundled Grype config to an absolute filesystem path.
 *
 * @throws RangeError if `preset` is not a bundled preset name.
 */
export function getGrypeConfigPath(preset: GrypePreset = "default"): string {
    switch (preset) {
        case "ci":
        case "critical":
        case "default":
        case "maven":
        case "maximum":
        case "strict": {
            return paths[preset];
        }
        default: {
            throw new RangeError(
                "Unknown Grype preset. Expected one of: default, strict, maximum, critical, ci, maven."
            );
        }
    }
}

/** Load one bundled Grype config as YAML text. */
export async function loadGrypeConfig(
    preset: GrypePreset = "default"
): Promise<string> {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- The resolver returns only package-owned preset paths.
    return readFile(getGrypeConfigPath(preset), "utf8");
}

export default grypeConfigPath;
