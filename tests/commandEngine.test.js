import assert from 'assert';
import { CommandEngine } from '../src/simulation/commandEngine.js';

console.log('Running Command Engine Tests...');

const engine = new CommandEngine();

const testCases = ['ls -la', 'cat notes.txt', 'mkdir project', 'kill -9 1337', 'custom_tool --flag'];

testCases.forEach(cmd => {
  const plan = engine.generatePlan(cmd);
  assert(plan, `Plan must be generated for '${cmd}'`);
  assert(plan.name, 'Plan must have name');
  assert(Array.isArray(plan.stages), 'Plan must have stages array');
  assert(plan.stages.length > 0, 'Plan must contain at least one stage');
  plan.stages.forEach((stage, sIdx) => {
    assert(stage.name, `Stage ${sIdx} must have name`);
    assert(stage.layer, `Stage ${sIdx} must specify layer`);
  });
});

console.log(`✓ Validated plan generation for ${testCases.length} distinct command patterns.`);
