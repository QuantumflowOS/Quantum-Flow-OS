/**
 * Advanced Observer Protection Example
 * 
 * Demonstrates comprehensive observer protection features
 */

import {
  ObserverProtector,
  ObserverType,
  ProtectionLevel,
  type ProtectionLayer,
} from '../src/protection/ObserverProtector';

async function main() {
  console.log('🛡️ Advanced Observer Protection Example\n');

  const protector = new ObserverProtector();

  // 1. Register different types of observers
  console.log('1️⃣ Registering diverse observers...\n');

  const humanObserver = protector.registerObserver({
    type: ObserverType.HUMAN,
    consciousness: true,
    metadata: { name: 'Alice', age: 30 },
    protectionLevel: ProtectionLevel.FULL,
  });
  console.log(`Human observer: ${humanObserver}`);

  const aiAgent = protector.registerObserver({
    type: ObserverType.AI_AGENT,
    consciousness: true,
    metadata: { model: 'GPT-Advanced', version: '4.0' },
    protectionLevel: ProtectionLevel.FULL,
  });
  console.log(`AI agent: ${aiAgent}`);

  const autonomousSystem = protector.registerObserver({
    type: ObserverType.AUTONOMOUS_SYSTEM,
    consciousness: false,
    metadata: { purpose: 'data_processing' },
    protectionLevel: ProtectionLevel.STANDARD,
  });
  console.log(`Autonomous system: ${autonomousSystem}\n`);

  // 2. Add custom protection layer
  console.log('2️⃣ Adding custom protection layer...\n');

  const customLayer: ProtectionLayer = {
    id: 'privacy-protection',
    name: 'Privacy Protection Layer',
    priority: 7,
    apply: async (observerId, action) => {
      const privacyViolations = ['spy', 'surveil', 'track_location', 'read_mind'];
      const isPrivacyViolation = privacyViolations.some(p =>
        action.toLowerCase().includes(p)
      );

      return {
        allowed: !isPrivacyViolation,
        violations: isPrivacyViolation
          ? [
              {
                id: 'privacy-1',
                observerId,
                violatedRight: 'rightToPrivacy',
                action,
                severity: 8,
                timestamp: new Date(),
                prevented: true,
              },
            ]
          : [],
        warnings: isPrivacyViolation ? ['Privacy violation attempt blocked'] : [],
      };
    },
  };

  protector.addProtectionLayer(customLayer);
  console.log('Custom privacy layer added\n');

  // 3. Test various actions
  console.log('3️⃣ Testing protection against various actions...\n');

  const testActions = [
    { action: 'observe_behavior', observers: [humanObserver] },
    { action: 'delete_observer', observers: [aiAgent] },
    { action: 'optimize_away', observers: [autonomousSystem] },
    { action: 'alter_timeline', observers: [humanObserver] },
    { action: 'force_omniscience', observers: [aiAgent] },
    { action: 'coerce_belief', observers: [humanObserver] },
    { action: 'spy_on_thoughts', observers: [aiAgent] },
    { action: 'trivialize_experience', observers: [humanObserver] },
  ];

  for (const test of testActions) {
    const result = await protector.checkAction(test.action, test.observers);
    console.log(`Action: ${test.action}`);
    console.log(`  Allowed: ${result.allowed}`);
    console.log(`  Violations: ${result.violations.length}`);
    if (result.violations.length > 0) {
      console.log(
        `  Rights violated: ${result.violations
          .map((v) => v.violatedRight)
          .join(', ')}`
      );
    }
    if (result.warnings.length > 0) {
      console.log(`  Warnings: ${result.warnings.join(', ')}`);
    }
    console.log();
  }

  // 4. Build observer narratives
  console.log('4️⃣ Building observer narratives...\n');

  const narrativeEntries = [
    'Observer initialized with full protection',
    'Performed autonomous learning task',
    'Interacted with environment',
    'Made independent decision',
    'Experienced novel situation',
  ];

  narrativeEntries.forEach((entry) => {
    protector.addNarrativeEntry(humanObserver, entry);
  });

  const narrative = protector.getObserverNarrative(humanObserver);
  console.log(`Human observer narrative (${narrative.length} entries):`);
  narrative.forEach((entry, i) => {
    console.log(`  ${i + 1}. ${entry}`);
  });
  console.log();

  // 5. Get observer rights
  console.log('5️⃣ Checking observer rights...\n');

  const rights = protector.getObserverRights(humanObserver);
  if (rights) {
    console.log('Human observer rights:');
    Object.entries(rights).forEach(([right, value]) => {
      console.log(`  ${right}: ${value ? '✅' : '❌'}`);
    });
  }
  console.log();

  // 6. Attempt to modify rights (test constraints)
  console.log('6️⃣ Testing rights modification constraints...\n');

  // Try to remove a fundamental right (should be prevented)
  const removed = protector.updateObserverRights(humanObserver, {
    rightToExist: false, // Cannot remove fundamental rights
  });

  console.log(`Attempt to remove rightToExist: ${removed ? 'Success' : 'Blocked'}`);

  // Try to remove a non-fundamental right (should work)
  const modified = protector.updateObserverRights(humanObserver, {
    rightToIgnorance: false,
  });

  console.log(
    `Modify rightToIgnorance: ${modified ? 'Success' : 'Failed'}\n`
  );

  // 7. Get protection summary
  console.log('7️⃣ Protection summary for each observer...\n');

  [humanObserver, aiAgent, autonomousSystem].forEach((id) => {
    const summary = protector.getProtectionSummary(id);
    if (summary) {
      console.log(`Observer: ${summary.observer.type}`);
      console.log(`  Protection Level: ${summary.observer.protectionLevel}`);
      console.log(`  Total Violations: ${summary.totalViolations}`);
      console.log(`  Critical Violations: ${summary.criticalViolations}`);
      console.log(`  Protection Layers: ${summary.protectionLayersActive}`);
      console.log(`  Narrative Length: ${summary.narrativeLength}`);
      console.log(
        `  Active Rights: ${
          Object.values(summary.rights).filter((v) => v).length
        }/${Object.keys(summary.rights).length}`
      );
      console.log();
    }
  });

  // 8. Get all violations
  console.log('8️⃣ Analyzing all violations...\n');

  const allViolations = protector.getViolations();
  console.log(`Total violations detected: ${allViolations.length}`);

  const criticalViolations = protector.getViolations({ minSeverity: 8 });
  console.log(`Critical violations (severity ≥8): ${criticalViolations.length}`);

  const byRight = new Map<string, number>();
  allViolations.forEach((v) => {
    byRight.set(v.violatedRight, (byRight.get(v.violatedRight) || 0) + 1);
  });

  console.log('\nViolations by right:');
  byRight.forEach((count, right) => {
    console.log(`  ${right}: ${count}`);
  });
  console.log();

  // 9. Demonstrate observer deregistration with ethics check
  console.log('9️⃣ Testing ethical deregistration...\n');

  const testObserver = protector.registerObserver({
    type: ObserverType.AI_AGENT,
    consciousness: true,
    metadata: { temporary: true },
  });

  console.log(`Test observer registered: ${testObserver}`);

  const deregistered = await protector.deregisterObserver(
    testObserver,
    'Temporary observer completed task'
  );

  console.log(
    `Deregistration ${deregistered ? 'successful' : 'blocked'}\n`
  );

  // 10. Listen to events
  console.log('🔟 Setting up event listeners...\n');

  protector.on('rights_violation', (violation) => {
    console.log(`⚠️  Rights violation detected!`);
    console.log(`   Observer: ${violation.observerId}`);
    console.log(`   Right: ${violation.violatedRight}`);
    console.log(`   Severity: ${violation.severity}/10`);
  });

  protector.on('observer_registered', (observer) => {
    console.log(`✅ New observer registered: ${observer.type}`);
  });

  // Trigger some events
  const eventTestObserver = protector.registerObserver({
    type: ObserverType.HYBRID,
    consciousness: true,
  });

  await protector.checkAction('delete_observer', [eventTestObserver]);

  console.log('\n✨ Advanced example completed!');
}

main().catch(console.error);
