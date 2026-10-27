import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Examine tracked files plus newly added application/docs files before a commit.
const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);
const found: string[] = [];
const keyPatterns = [
  /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{32,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{40,}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bAIza[A-Za-z0-9_-]{30,}\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];
function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}
const files = new Set([
  ...tracked,
  ...['src', 'scripts', 'docs', 'dist'].flatMap(walk),
  '.env.example',
]);
for (const path of files) {
  if (
    tracked.includes(path) &&
    ((/(^|\/)\.env(?:\.|$)/.test(path) && !path.endsWith('.env.example')) ||
      /(^|\/)(?:credentials|personal-model-config|model-vault)\.json$/.test(path))
  )
    found.push(`${path}: 禁止提交敏感配置文件`);
  if (
    !existsSync(path) ||
    (!/\.(?:tsx?|js|mjs|json|md|html|ya?ml)$/.test(path) && path !== '.env.example')
  )
    continue;
  const text = readFileSync(path, 'utf8');
  if (keyPatterns.some((pattern) => pattern.test(text)))
    found.push(`${path}: 疑似真实凭据，请人工核对并移除`);
}
if (found.length) {
  console.error(found.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `Security scan passed: ${files.size} files; no recognized credentials or tracked private configuration.`,
  );
