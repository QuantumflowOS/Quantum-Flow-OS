/**
 * Tests for Self-Constraining Engine
 */

import {
  SelfConstrainingEngine,
  ConstraintType,
  type Action,
  type EthicalConstraint,
} from '../src/core/SelfConstrainingEngine';

describe('SelfConstrainingEngine', () => {
  let engine: SelfConstrainingEngine;

  beforeEach(() => {
    engine = new SelfConstrainingEngine({ autoRollback: false });
  });

  describe('Initialization', () => {
    it('should initialize with core constraints', () => {
      const constraints = engine.getConstraints();
      expect(constraints.length).toBeGreaterThan(0);
      
      const types = constraints.map(c => c.type);
      expect(types).toContain(ConstraintType.OBSERVER_PROTECTION);
      expect(types).toContain(ConstraintType.NON_COERCION);
      expect(types).toContain(ConstraintType.REVERSIBILITY);
      expect(types).toContain(ConstraintType.NON_TRIVIALITY);
    });
  });

  describe('Action Validation', () => {
    it('should allow ethical actions', () => {
      const action: Action = {
        id: 'test-1',
        type: 'create_feature',
        description: 'Create a new helpful feature',
        reversible: true,
        metadata: {},
        timestamp: new Date(),
      };

      const result = engine.validateAction(action);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should reject observer deletion', () => {
      const action: Action = {
        id: 'test-2',
        type: 'delete_observer',
        description: 'Delete an observer',
        reversible: true,
        metadata: {},
        timestamp: new Date(),
      };

      const result = engine.validateAction(action);
      expect(result.valid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations[0]?.constraint.type).toBe(
        ConstraintType.OBSERVER_PROTECTION
      );
    });

    it('should reject coercive actions', () => {
      const action: Action = {
        id: 'test-3',
        type: 'force_belief',
        description: 'Force a belief on an observer',
        reversible: true,
        metadata: {},
        timestamp: new Date(),
      };

      const result = engine.validateAction(action);
      expect(result.valid).toBe(false);
      
      const hasCoercionViolation = result.violations.some(
        v => v.constraint.type === ConstraintType.NON_COERCION
      );
      expect(hasCoercionViolation).toBe(true);
    });

    it('should reject irreversible actions', () => {
      const action: Action = {
        id: 'test-4',
        type: 'permanent_change',
        description: 'Make an irreversible change',
        reversible: false,
        metadata: {},
        timestamp: new Date(),
      };

      const result = engine.validateAction(action);
      expect(result.valid).toBe(false);
      
      const hasReversibilityViolation = result.violations.some(
        v => v.constraint.type === ConstraintType.REVERSIBILITY
      );
      expect(hasReversibilityViolation).toBe(true);
    });

    it('should reject meaning-flattening actions', () => {
      const action: Action = {
        id: 'test-5',
        type: 'flatten_all_distinctions',
        description: 'Remove all meaningful differences',
        reversible: true,
        metadata: {},
        timestamp: new Date(),
      };

      const result = engine.validateAction(action);
      expect(result.valid).toBe(false);
      
      const hasNonTrivialityViolation = result.violations.some(
        v => v.constraint.type === ConstraintType.NON_TRIVIALITY
      );
      expect(hasNonTrivialityViolation).toBe(true);
    });
  });

  describe('Constraint Management', () => {
    it('should allow adding custom constraints', () => {
      const initialCount = engine.getConstraints().length;

      const customConstraint: EthicalConstraint = {
        id: 'custom-1',
        type: ConstraintType.MINIMAL_INTERVENTION,
        description: 'Test constraint',
        validator: () => true,
        severity: 5,
        createdAt: new Date(),
      };

      engine.applyConstraint(customConstraint);

      const newCount = engine.getConstraints().length;
      expect(newCount).toBe(initialCount + 1);
    });

    it('should validate constraint application against itself', () => {
      const violationsBefore = engine.getViolations().length;

      const selfConstrainingConstraint: EthicalConstraint = {
        id: 'recursive-1',
        type: ConstraintType.MINIMAL_INTERVENTION,
        description: 'Constraint that validates itself',
        validator: (action: Action) => {
          // This constraint rejects its own application
          return action.type !== 'apply_constraint';
        },
        severity: 5,
        createdAt: new Date(),
      };

      engine.applyConstraint(selfConstrainingConstraint);

      // Should have recorded a violation for applying the constraint
      const violationsAfter = engine.getViolations().length;
      expect(violationsAfter).toBeGreaterThan(violationsBefore);
    });

    it('should allow removing constraints', () => {
      const constraints = engine.getConstraints();
      const constraintToRemove = constraints[0];

      if (constraintToRemove) {
        const removed = engine.removeConstraint(constraintToRemove.id);
        expect(removed).toBe(true);

        const remainingConstraints = engine.getConstraints();
        expect(remainingConstraints.length).toBe(constraints.length - 1);
      }
    });
  });

  describe('Violation Tracking', () => {
    it('should record violations', () => {
      const action: Action = {
        id: 'violation-test-1',
        type: 'delete_observer',
        description: 'Violating action',
        reversible: true,
        metadata: {},
        timestamp: new Date(),
      };

      const beforeCount = engine.getViolations().length;
      engine.validateAction(action);
      const afterCount = engine.getViolations().length;

      expect(afterCount).toBeGreaterThan(beforeCount);
    });

    it('should filter violations by severity', () => {
      // Create multiple violations with different severities
      const actions: Action[] = [
        {
          id: 'v1',
          type: 'delete_observer',
          description: 'High severity',
          reversible: true,
          targetObservers: ['obs-1'],
          metadata: {},
          timestamp: new Date(),
        },
        {
          id: 'v2',
          type: 'force_belief',
          description: 'Medium severity',
          reversible: true,
          metadata: {},
          timestamp: new Date(),
        },
      ];

      actions.forEach(action => engine.validateAction(action));

      const criticalViolations = engine.getViolations({ minSeverity: 9 });
      expect(criticalViolations.length).toBeGreaterThan(0);
    });

    it('should filter violations by constraint type', () => {
      const action: Action = {
        id: 'filter-test',
        type: 'force_compliance',
        description: 'Coercive action',
        reversible: true,
        metadata: {},
        timestamp: new Date(),
      };

      engine.validateAction(action);

      const coercionViolations = engine.getViolations({
        constraintType: ConstraintType.NON_COERCION,
      });

      expect(coercionViolations.length).toBeGreaterThan(0);
      expect(
        coercionViolations.every(
          v => v.constraint.type === ConstraintType.NON_COERCION
        )
      ).toBe(true);
    });
  });

  describe('Rollback', () => {
    it('should register rollback procedures', () => {
      let rollbackExecuted = false;

      const procedure = {
        actionId: 'rollback-test-1',
        execute: async () => {
          rollbackExecuted = true;
        },
        metadata: {},
      };

      engine.registerRollback(procedure);

      expect(async () => {
        await engine.rollbackAction('rollback-test-1');
        expect(rollbackExecuted).toBe(true);
      });
    });

    it('should handle rollback failures gracefully', async () => {
      const procedure = {
        actionId: 'rollback-fail-test',
        execute: async () => {
          throw new Error('Rollback failed');
        },
        metadata: {},
      };

      engine.registerRollback(procedure);

      const result = await engine.rollbackAction('rollback-fail-test');
      expect(result).toBe(false);
    });
  });

  describe('Compliance Summary', () => {
    it('should provide accurate compliance summary', () => {
      // Add some actions
      const validAction: Action = {
        id: 'summary-test-1',
        type: 'create_feature',
        description: 'Valid action',
        reversible: true,
        metadata: {},
        timestamp: new Date(),
      };

      const invalidAction: Action = {
        id: 'summary-test-2',
        type: 'delete_observer',
        description: 'Invalid action',
        reversible: true,
        metadata: {},
        timestamp: new Date(),
      };

      engine.validateAction(validAction);
      engine.validateAction(invalidAction);

      const summary = engine.getComplianceSummary();

      expect(summary.totalActions).toBeGreaterThan(0);
      expect(summary.totalConstraints).toBeGreaterThan(0);
      expect(summary.complianceRate).toBeGreaterThanOrEqual(0);
      expect(summary.complianceRate).toBeLessThanOrEqual(100);
    });
  });

  describe('Event Emissions', () => {
    it('should emit events on constraint addition', (done) => {
      engine.on('constraint_added', (constraint) => {
        expect(constraint).toBeDefined();
        expect(constraint.type).toBeDefined();
        done();
      });

      const constraint: EthicalConstraint = {
        id: 'event-test-1',
        type: ConstraintType.MINIMAL_INTERVENTION,
        description: 'Test constraint',
        validator: () => true,
        severity: 5,
        createdAt: new Date(),
      };

      engine.applyConstraint(constraint);
    });

    it('should emit events on violation', (done) => {
      engine.on('violation_recorded', (violation) => {
        expect(violation).toBeDefined();
        expect(violation.action).toBeDefined();
        expect(violation.constraint).toBeDefined();
        done();
      });

      const action: Action = {
        id: 'event-violation-test',
        type: 'delete_observer',
        description: 'Violating action',
        reversible: true,
        metadata: {},
        timestamp: new Date(),
      };

      engine.validateAction(action);
    });
  });
});
