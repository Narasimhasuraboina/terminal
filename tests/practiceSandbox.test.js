import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('Running Practice Sandbox Verification Tests...');

const requiredFiles = [
  'practice_sandbox/config/nginx.conf',
  'practice_sandbox/config/docker-compose.yml',
  'practice_sandbox/var_log/auth.log',
  'practice_sandbox/var_log/nginx_access.log',
  'practice_sandbox/data.json',
  'practice_sandbox/hosts',
  'practice_sandbox/sysinfo.sh',
  'practice_sandbox/services.tsv'
];

requiredFiles.forEach(relPath => {
  const absPath = path.resolve(relPath);
  assert(fs.existsSync(absPath), `Required sandbox file missing: ${relPath}`);
  const stats = fs.statSync(absPath);
  assert(stats.size > 0, `Sandbox file should not be empty: ${relPath}`);
});

console.log(`✓ Verified presence and content of ${requiredFiles.length} sandbox scenario files.`);
