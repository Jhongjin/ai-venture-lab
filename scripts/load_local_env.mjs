import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const defaultEnvFiles = [".env", ".env.local", ".env.production.local"];

function parseEnvLine(line) {
  const trimmedLine = line.trim();

  if (!trimmedLine || trimmedLine.startsWith("#")) {
    return null;
  }

  const normalizedLine = trimmedLine.startsWith("export ") ? trimmedLine.slice("export ".length).trim() : trimmedLine;
  const match = normalizedLine.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);

  if (!match) {
    return null;
  }

  const [, name, rawValue] = match;
  let value = rawValue.trim();
  const quote = value[0];

  if ((quote === '"' || quote === "'") && value.endsWith(quote)) {
    value = value.slice(1, -1);
  }

  if (quote === '"') {
    value = value.replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t");
  }

  return { name, value };
}

export function loadLocalEnvFiles({ cwd = process.cwd(), files = defaultEnvFiles } = {}) {
  for (const file of files) {
    const envPath = path.resolve(cwd, file);

    if (!existsSync(envPath)) {
      continue;
    }

    const content = readFileSync(envPath, "utf8");

    for (const line of content.split(/\r?\n/)) {
      const parsed = parseEnvLine(line);

      if (!parsed || process.env[parsed.name] !== undefined) {
        continue;
      }

      process.env[parsed.name] = parsed.value;
    }
  }
}
