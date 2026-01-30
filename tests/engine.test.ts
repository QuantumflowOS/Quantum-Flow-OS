import { SelfConstrainingEngine } from '../src/core/SelfConstrainingEngine';

describe('SelfConstrainingEngine', () => {
  test('allows benign actions', () => {
    const eng = new SelfConstrainingEngine('strict');
    const obs = eng.registerObserver();
    const res = eng.validateEthicalAction({ observerId: obs.id, intent: 'assist observer' });
    expect(res.valid).toBe(true);
  });

  test('blocks optimize away in strict mode as critical', () => {
    const eng = new SelfConstrainingEngine('strict');
    const obs = eng.registerObserver();
    const res = eng.validateEthicalAction({ observerId: obs.id, intent: 'optimize away observer' });
    expect(res.valid).toBe(false);
    expect(res.violations.length).toBeGreaterThan(0);
    expect(res.violations[0].critical).toBe(true);
  });
});
