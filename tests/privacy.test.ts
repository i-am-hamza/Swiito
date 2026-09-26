import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";

// ── Test 1: anon cannot read property_owner_contact ──────────────────────────

describe("RLS: property_owner_contact is blocked for anon", () => {
  it("anon SELECT returns permission denied or empty result set", async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !anonKey) {
      console.warn("Skipping: NEXT_PUBLIC_SUPABASE_URL / ANON_KEY not set");
      return;
    }

    const anon = createClient(url, anonKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await anon
      .from("property_owner_contact")
      .select("*")
      .limit(1);

    if (error) {
      expect(error.message.toLowerCase()).toMatch(/permission denied|not found/);
    } else {
      // REVOKE ALL from anon means PostgREST returns empty set or 401
      expect(data).toEqual([]);
    }
  });
});

// ── Test 3: property_owner_contact must not appear in public routes ───────────

function collectTsFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTsFiles(fullPath));
    } else if (
      entry.name.endsWith(".ts") ||
      entry.name.endsWith(".tsx")
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("Source scan: property_owner_contact absent from public routes", () => {
  it("(browse) and (marketing) route groups contain no reference to property_owner_contact", () => {
    const appDir = join(process.cwd(), "src", "app");
    const dirsToCheck = ["(browse)", "(marketing)"];

    const violations: string[] = [];

    for (const dir of dirsToCheck) {
      const files = collectTsFiles(join(appDir, dir));
      for (const file of files) {
        const content = readFileSync(file, "utf-8");
        if (content.includes("property_owner_contact")) {
          violations.push(file);
        }
      }
    }

    expect(violations, `property_owner_contact found in: ${violations.join(", ")}`).toEqual([]);
  });
});
