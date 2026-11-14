# Java 26.3 runtime pilot
Java pack metadata with min_format [97,1] and max_format 97 now passes conversion and produces a Bedrock manifest v2 with min_engine_version [1,26,50]. Legacy pack metadata retains its previous manifest behavior.
The 378 scoped path corrections activate for unambiguously detected 26.3 packs. Explicit javaVersion/bedrockVersion options override detection. 1.26.50.4 is the only modern target profile.
Four copper chest finishes reuse existing single/double chest UV transforms. Unoxidized copper becomes copper_default before image transformation.
IMPORTANT: Bed face reconstruction, sign UV assembly, updated GUI layouts, animation/model references and full in-game tests remain unverified and incomplete. This commit is not proof of full Java 26.3 support.
