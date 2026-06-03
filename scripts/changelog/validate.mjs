#!/usr/bin/env node
import { loadChangelogFiles, validateEntries } from "./lib.mjs";

async function main() {
  const entries = await loadChangelogFiles();
  const errors = validateEntries(entries);

  if (errors.length > 0) {
    console.error(
      `\n✗ Changelog validation failed (${errors.length} problem(s)):\n`,
    );
    for (const error of errors) {
      console.error(`  • ${error}`);
    }
    console.error(
      "\nSee content/changelog/README.md for the expected format.\n",
    );
    process.exit(1);
  }

  console.log(`✓ ${entries.length} changelog file(s) valid.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
