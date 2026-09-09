import assert from 'assert';
import { VirtualLinuxEnv } from '../src/simulation/virtualLinuxEnv.js';

console.log('Running VFS Integrity Tests...');

const vfs = new VirtualLinuxEnv();
assert(vfs.fs, 'VFS must initialize with root filesystem tree');
assert(vfs.fs.type === 'dir', 'Root directory must have type dir');
assert(vfs.fs.children.home, 'Root directory must contain home');

// Test path resolution
assert.strictEqual(vfs.currentPath, '/home/user', 'Default directory should be /home/user');
vfs.execute('cd /');
assert.strictEqual(vfs.currentPath, '/', 'Current path after cd / should be /');

// Test mkdir
vfs.execute('mkdir /testdir');
const lsRes = vfs.execute('ls /');
assert(lsRes.output.includes('testdir'), 'Newly created directory should appear in ls');

// Test cd -
vfs.execute('cd /home/user');
const cdDashRes = vfs.execute('cd -');
assert.strictEqual(cdDashRes.output, '/', 'cd - should return to previous path /');
assert.strictEqual(vfs.currentPath, '/', 'Current path should now be /');

// Test file.txt fixture for cat preset
const catRes = vfs.execute('cat /home/user/file.txt');
assert(catRes.output.includes('SYSTEM LOG'), 'cat file.txt must output kernel log');

// Test kill -9 1337 for kill preset
const killRes = vfs.execute('kill -9 1337');
assert(killRes.output.includes('Killed') && killRes.output.includes('heavy_worker'), 'kill -9 1337 must terminate heavy_worker');

// Test grep -v
const grepVRes = vfs.execute('grep -v "Linux" /home/user/notes.txt');
assert(!grepVRes.output.includes('Linux Operating System Notes'), 'grep -v should invert match');

// Test catalog fallback
const topRes = vfs.execute('top');
assert(topRes.output.includes('Tasks:'), 'top should fallback to catalog output');

console.log('✓ VFS node traversal, presets, flags, and filesystem operations verified.');
