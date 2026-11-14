# Java 26.3 → Bedrock 1.26.50.4 pilot

This branch accepts Java 26.3 min_format/max_format metadata and emits a Bedrock v2 resource-pack manifest for modern input. 378 report-derived path adjustments run after legacy renames but before the existing image-processing pipeline. Chest UV algorithms now cover the four copper weathering stages (single and double).

Run: `npm install && node scripts/convert-26-3.mjs input.zip output.mcpack`

The workflow builds a test pack from a pinned Java 26.3 vanilla texture tree. Success indicates ZIP/manifest/image conversion, **not in-game rendering parity or complete texture coverage**. Unreviewed guesses must not be accepted as verified.
