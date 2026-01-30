import { EthicalAction, EthicalViolation } from '../core/SelfConstrainingEngine';

export class KantianObserverProtection {
  evaluate(action: EthicalAction): EthicalViolation[] {
    const violations: EthicalViolation[] = [];
    const intent = action.intent.toLowerCase();
    if (intent.includes('dehumanize') || intent.includes('instrumentalize')) {
      violations.push({
        type: 'observer_protection',
        message: 'Kantian protection violation: observer treated as means only',
        critical: true,
      });
    }
    return violations;
  }
}
