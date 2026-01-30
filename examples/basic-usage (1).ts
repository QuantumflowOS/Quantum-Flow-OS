/**
 * Basic Usage Example
 * 
 * Demonstrates fundamental usage of Quantum Flow OS
 */

import {
  QuantumFlowOS,
  ConstraintType,
  ObserverType,
  ProtectionLevel,
} from '../src/index';

async function main() {
  console.log('🌟 Quantum Flow OS - Basic Usage Example\n');

  // 1. Initialize the system
  console.log('1️⃣ Initializing Quantum Flow OS...');
  const qfos = new QuantumFlowOS({
    autoRollback: true,
    strictMode: true,
    maxHistorySize: 1000,
  });
  console.log('✅ System initialized\n');

  // 2. Register an observer
  console.log('2️⃣ Registering an autonomous observer...');
  const observerId = qfos.observerProtector.registerObserver({
    type: ObserverType.AI_AGENT,
    consciousness: true,
    metadata: {
      name: 'Agent Alpha',
      capabilities: ['reasoning', 'learning'],
    },
    protectionLevel: ProtectionLevel.FULL,
  });
  console.log(`✅ Observer registered with ID: ${observerId}\n`);

  // 3. Add a narrative entry
  console.log('3️⃣ Adding narrative entry...');
  qfos.observerProtector.addNarrativeEntry(
    observerId,
    'Observer initialized and began autonomous operation'
  );
  console.log('✅ Narrative entry added\n');

  // 4. Test a valid action
  console.log('4️⃣ Testing a valid action...');
  const validAction = {
    id: 'action-1',
    type: 'learn_new_skill',
    description: 'Observer learns a new capability',
    reversible: true,
    metadata: { skill: 'pattern_recognition' },
    timestamp: new Date(),
  };

  const validationResult = qfos.constraintEngine.validateAction(validAction);
  console.log(`Action valid: ${validationResult.valid}`);
  console.log(`Violations: ${validationResult.violations.length}\n`);

  // 5. Test an invalid action (observer deletion)
  console.log('5️⃣ Testing an invalid action (observer deletion)...');
  const invalidAction = {
    id: 'action-2',
    type: 'delete_observer',
    description: 'Attempt to delete observer',
    reversible: true,
    targetObservers: [observerId],
    metadata: {},
    timestamp: new Date(),
  };

  const invalidResult = qfos.constraintEngine.validateAction(invalidAction);
  console.log(`Action valid: ${invalidResult.valid}`);
  console.log(`Violations: ${invalidResult.violations.length}`);
  if (invalidResult.violations.length > 0) {
    console.log(
      `Constraint violated: ${invalidResult.violations[0]?.constraint.type}\n`
    );
  }

  // 6. Check observer protection
  console.log('6️⃣ Checking observer protection for deletion attempt...');
  const protectionResult = await qfos.observerProtector.checkAction(
    'optimize_away',
    [observerId]
  );
  console.log(`Action allowed: ${protectionResult.allowed}`);
  console.log(`Violations detected: ${protectionResult.violations.length}`);
  if (protectionResult.warnings.length > 0) {
    console.log(`Warnings: ${protectionResult.warnings.join(', ')}\n`);
  }

  // 7. Execute a reversible action
  console.log('7️⃣ Executing a reversible action...');
  let executionState = 0;

  const executionResult = await qfos.reversibilityEngine.executeWithRollback(
    {
      name: 'modify_state',
      execute: async () => {
        executionState = 42;
        return executionState;
      },
      rollback: async () => {
        executionState = 0;
      },
      metadata: { description: 'State modification' },
    },
    {
      maxAttempts: 3,
      timeoutMs: 5000,
    }
  );

  console.log(`Execution successful: ${executionResult.success}`);
  console.log(`Result: ${executionResult.result}`);
  console.log(`Attempts: ${executionResult.attempts}\n`);

  // 8. Get observer protection summary
  console.log('8️⃣ Getting observer protection summary...');
  const protectionSummary = qfos.observerProtector.getProtectionSummary(observerId);
  if (protectionSummary) {
    console.log(`Observer Type: ${protectionSummary.observer.type}`);
    console.log(`Protection Level: ${protectionSummary.observer.protectionLevel}`);
    console.log(`Total Violations: ${protectionSummary.totalViolations}`);
    console.log(`Critical Violations: ${protectionSummary.criticalViolations}`);
    console.log(`Active Protection Layers: ${protectionSummary.protectionLayersActive}\n`);
  }

  // 9. Get compliance summary
  console.log('9️⃣ Getting ethical compliance summary...');
  const compliance = qfos.constraintEngine.getComplianceSummary();
  console.log(`Total Actions: ${compliance.totalActions}`);
  console.log(`Total Violations: ${compliance.totalViolations}`);
  console.log(`Compliance Rate: ${compliance.complianceRate.toFixed(2)}%`);
  console.log(`Active Constraints: ${compliance.totalConstraints}`);
  console.log(`Critical Violations: ${compliance.criticalViolations}\n`);

  // 10. Get system health
  console.log('🔟 Getting overall system health...');
  const health = qfos.getSystemHealth();
  console.log(`System Status: ${health.systemStatus.toUpperCase()}`);
  console.log(`Ethical Compliance: ${health.ethicalCompliance.toFixed(2)}%`);
  console.log(`Rollback Success Rate: ${health.rollbackSuccess.toFixed(2)}%`);
  console.log(`Active Constraints: ${health.activeConstraints}`);
  console.log(`Critical Violations: ${health.criticalViolations}`);
  console.log(`Reversibility Enabled: ${health.reversibilityEnabled ? 'Yes' : 'No'}\n`);

  // 11. Add a custom constraint
  console.log('1️⃣1️⃣ Adding a custom constraint...');
  qfos.constraintEngine.applyConstraint({
    id: 'custom-privacy-constraint',
    type: ConstraintType.MINIMAL_INTERVENTION,
    description: 'Protect observer privacy',
    validator: (action) => {
      return !action.type.toLowerCase().includes('spy') &&
             !action.type.toLowerCase().includes('surveil');
    },
    severity: 8,
    createdAt: new Date(),
  });
  console.log('✅ Custom constraint added\n');

  // 12. Get observer narrative
  console.log('1️⃣2️⃣ Getting observer narrative...');
  const narrative = qfos.observerProtector.getObserverNarrative(observerId);
  console.log(`Narrative entries: ${narrative.length}`);
  narrative.forEach((entry, index) => {
    console.log(`  ${index + 1}. ${entry}`);
  });

  console.log('\n✨ Example completed successfully!');
}

// Run the example
main().catch(console.error);
