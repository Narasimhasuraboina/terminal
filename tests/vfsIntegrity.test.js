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

console.log('✓ VFS node traversal and filesystem operations verified.');
