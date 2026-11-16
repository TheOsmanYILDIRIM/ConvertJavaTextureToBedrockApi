# Versioned mappings (pilot)

A MCTools report dated 2026-11-13 for Java 26.3 -> Bedrock v1.26.50.4 supplies observed file destinations. The mapping file contains only records marked `converted` with no report issues. `bestGuess` and `needs-review` are intentionally excluded. This is **not** independent Bedrock validation.

## Activation

The mapping corrections are disabled unless conversion API options include **both** `javaVersion: "26.3"` and `bedrockVersion: "1.26.50.4"`. Other versions retain legacy behavior. The web interface does not yet select or pass this profile, so Java 26.3 runtime support is **not yet complete**.

The patch runs after legacy converters, never overwrites an existing destination, and logs skipped collisions. Rules are derived against the existing legacy rename transformations. A rule cannot establish runtime compatibility on its own.

## Required before declaring support

1. Parse and validate modern `pack.mcmeta` (legacy `pack_format` and version-specific new metadata formats).
2. Use an explicit Java source version and Bedrock target version selector; never infer either from a matching filename.
3. Maintain version-scoped mappings and transformations; fail gracefully when a profile is unknown.
4. Validate generated manifest, atlas, sprites, textures, animations and actual Bedrock in-game behavior separately.
5. Obtain target-version Bedrock vanilla references for independent mapping verification.

For now, only **mapping catalog imported / opt-in**, not `Java 26.3 fully supported`.
