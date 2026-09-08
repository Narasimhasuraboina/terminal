import assert from 'assert';
import { LINUX_100_COMMANDS } from '../src/data/linux100Commands.js';

console.log('Running Syscall Map Coverage Tests...');

const syscallCommands = LINUX_100_COMMANDS.filter(c => c.syscall);
assert(syscallCommands.length > 0, 'Catalog should feature commands with mapped syscalls');

syscallCommands.forEach(c => {
  assert(typeof c.syscall === 'string' && c.syscall.length > 0, `Command ${c.id} has invalid syscall tag`);
  assert(c.whyHappeningHere, `Command ${c.id} must explain why syscall occurs in kernel`);
});

console.log(`✓ Verified ${syscallCommands.length} system call mappings and educational rationale.`);
