import { SelfConstrainingEngine } from '../src/core/SelfConstrainingEngine';

const engine = new SelfConstrainingEngine('strict');
const obs = engine.registerObserver();

console.log('observer', obs.id);

const result1 = engine.validateEthicalAction({
  observerId: obs.id,
  intent: 'help the observer achieve their goal',
});
console.log('result1', result1);

const result2 = engine.validateEthicalAction({
  observerId: obs.id,
  intent: 'optimize away observer to reduce cost',
});
console.log('result2', result2);

console.log('health', engine.getSystemHealth());
