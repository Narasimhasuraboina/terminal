import assert from 'assert';
import { LINUX_100_COMMANDS, CATEGORIES } from '../src/data/linux100Commands.js';

console.log('Running Catalog Integrity Tests...');

assert(Array.isArray(LINUX_100_COMMANDS), 'LINUX_100_COMMANDS must be an array');
assert(LINUX_100_COMMANDS.length >= 100, `Catalog should have at least 100 commands, got ${LINUX_100_COMMANDS.length}`);

const idSet = new Set();
const categoryIds = new Set(CATEGORIES.map(c => c.id));

LINUX_100_COMMANDS.forEach((cmd, idx) => {
  assert(cmd.id, `Command at index ${idx} must have an id`);
  assert(!idSet.has(cmd.id), `Duplicate command ID detected: ${cmd.id}`);
  idSet.add(cmd.id);

  assert(cmd.name, `Command ${cmd.id} missing name`);
  assert(cmd.command, `Command ${cmd.id} missing command string`);
  assert(cmd.mission, `Command ${cmd.id} missing mission description`);
  assert(cmd.hint, `Command ${cmd.id} missing hint`);
  assert(categoryIds.has(cmd.category), `Command ${cmd.id} has invalid category: ${cmd.category}`);
  assert(typeof cmd.xp === 'number' && cmd.xp > 0, `Command ${cmd.id} invalid XP value`);
});

console.log(`✓ Validated ${LINUX_100_COMMANDS.length} command catalog entries.`);
