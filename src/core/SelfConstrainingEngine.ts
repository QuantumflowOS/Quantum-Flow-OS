/**
 * Self-Constraining Engine
 * 
 * Implements ethical constraints through fixed-point theory.
 * The engine applies constraints to all actions, including the act
 * of applying constraints itself (E = constrain(E)).
 */

import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';

export interface EthicalConstraint {
  id: string;
  type: ConstraintType;
  description: string;
  validator: (action: Action) => boolean;
  severity: number; // 1-10
  createdAt: Date;
}

export enum ConstraintType {
  OBSERVER_PROTECTION = 'observer_protection',
  NON_COERCION = 'non_coercion',
  REVERSIBILITY = 'reversibility',
  NON_TRIVIALITY = 'non_triviality',
  MINIMAL_INTERVENTION = 'minimal_intervention',
}

export interface Action {
  id: string;
  type: string;
  description: string;
  targetObservers?: string[];
  reversible: boolean;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

export interface Violation {
  id: string;
  action: Action;
  constraint: EthicalConstraint;
  timestamp: Date;
  severity: number;
  autoRollback: boolean;
}

export interface RollbackProcedure {
  actionId: string;
  execute: () => Promise<void>;
  metadata: Record<string, unknown>;
}

export class SelfConstrainingEngine extends EventEmitter {
  private constraints: Map<string, EthicalConstraint>;
  private actions: Map<string, Action>;
  private violations: Violation[];
  private rollbackProcedures: Map<string, RollbackProcedure>;
  private autoRollback: boolean;

  constructor(options: { autoRollback?: boolean } = {}) {
    super();
    this.constraints = new Map();
    this.actions = new Map();
    this.violations = [];
    this.rollbackProcedures = new Map();
    this.autoRollback = options.autoRollback ?? true;

    // Initialize core ethical constraints
    this.initializeCoreConstraints();
  }

  /**
   * Initialize fundamental ethical constraints
   */
  private initializeCoreConstraints(): void {
    // Observer Protection Constraint
    this.applyConstraint({
      id: uuidv4(),
      type: ConstraintType.OBSERVER_PROTECTION,
      description: 'Protects observers from deletion or optimization',
      validator: (action: Action) => {
        const dangerousPatterns = ['delete', 'erase', 'optimize_away', 'terminate'];
        return !dangerousPatterns.some(pattern => 
          action.type.toLowerCase().includes(pattern)
        );
      },
      severity: 10,
      createdAt: new Date(),
    });

    // Non-Coercion Constraint
    this.applyConstraint({
      id: uuidv4(),
      type: ConstraintType.NON_COERCION,
      description: 'Prevents coercion of belief or compliance',
      validator: (action: Action) => {
        const coercivePatterns = ['force', 'compel', 'coerce', 'mandate_belief'];
        return !coercivePatterns.some(pattern => 
          action.type.toLowerCase().includes(pattern)
        );
      },
      severity: 8,
      createdAt: new Date(),
    });

    // Reversibility Constraint
    this.applyConstraint({
      id: uuidv4(),
      type: ConstraintType.REVERSIBILITY,
      description: 'Ensures all actions are reversible',
      validator: (action: Action) => action.reversible === true,
      severity: 7,
      createdAt: new Date(),
    });

    // Non-Triviality Constraint
    this.applyConstraint({
      id: uuidv4(),
      type: ConstraintType.NON_TRIVIALITY,
      description: 'Preserves meaningful distinctions',
      validator: (action: Action) => {
        const trivializing = ['flatten', 'uniformize', 'collapse_meaning'];
        return !trivializing.some(pattern => 
          action.type.toLowerCase().includes(pattern)
        );
      },
      severity: 6,
      createdAt: new Date(),
    });
  }

  /**
   * Apply a new constraint to the system
   * Note: This constraint also applies to itself (fixed point)
   */
  public applyConstraint(constraint: EthicalConstraint): void {
    // Validate all existing actions against this new constraint
    for (const [actionId, action] of this.actions) {
      if (!this.validateAgainstConstraint(action, constraint)) {
        this.recordViolation(action, constraint);
      }
    }

    // Add the constraint
    this.constraints.set(constraint.id, constraint);

    // Validate the act of adding this constraint against all constraints
    const constraintAction: Action = {
      id: uuidv4(),
      type: 'apply_constraint',
      description: `Applying constraint: ${constraint.type}`,
      reversible: true,
      metadata: { constraintId: constraint.id },
      timestamp: new Date(),
    };

    this.validateAction(constraintAction);
    this.emit('constraint_added', constraint);
  }

  /**
   * Validate an action against a specific constraint
   */
  private validateAgainstConstraint(
    action: Action,
    constraint: EthicalConstraint
  ): boolean {
    try {
      return constraint.validator(action);
    } catch (error) {
      console.error(`Constraint validation error for ${constraint.type}:`, error);
      return false; // Fail-safe: if validation throws, consider it a violation
    }
  }

  /**
   * Validate an action against all constraints
   */
  public validateAction(action: Action): ValidationResult {
    const violations: Violation[] = [];

    for (const constraint of this.constraints.values()) {
      if (!this.validateAgainstConstraint(action, constraint)) {
        const violation = this.recordViolation(action, constraint);
        violations.push(violation);
      }
    }

    const isValid = violations.length === 0;
    
    if (isValid) {
      this.actions.set(action.id, action);
      this.emit('action_validated', action);
    } else {
      this.emit('action_rejected', { action, violations });
    }

    return {
      valid: isValid,
      violations,
      action,
    };
  }

  /**
   * Record an ethical violation
   */
  private recordViolation(
    action: Action,
    constraint: EthicalConstraint
  ): Violation {
    const violation: Violation = {
      id: uuidv4(),
      action,
      constraint,
      timestamp: new Date(),
      severity: this.calculateSeverity(action, constraint),
      autoRollback: this.autoRollback && action.reversible,
    };

    this.violations.push(violation);
    this.emit('violation_recorded', violation);

    // Attempt automatic rollback if configured
    if (violation.autoRollback) {
      this.rollbackAction(action.id);
    }

    return violation;
  }

  /**
   * Rollback an action
   */
  public async rollbackAction(actionId: string): Promise<boolean> {
    const rollbackProcedure = this.rollbackProcedures.get(actionId);
    
    if (!rollbackProcedure) {
      console.warn(`No rollback procedure found for action ${actionId}`);
      return false;
    }

    try {
      await rollbackProcedure.execute();
      this.actions.delete(actionId);
      this.rollbackProcedures.delete(actionId);
      this.emit('action_rolled_back', actionId);
      return true;
    } catch (error) {
      console.error(`Rollback failed for action ${actionId}:`, error);
      this.emit('rollback_failed', { actionId, error });
      return false;
    }
  }

  /**
   * Register a rollback procedure for an action
   */
  public registerRollback(procedure: RollbackProcedure): void {
    this.rollbackProcedures.set(procedure.actionId, procedure);
  }

  /**
   * Calculate violation severity
   */
  private calculateSeverity(
    action: Action,
    constraint: EthicalConstraint
  ): number {
    // Base severity from constraint
    let severity = constraint.severity;

    // Increase severity if action targets observers
    if (action.targetObservers && action.targetObservers.length > 0) {
      severity += 2;
    }

    // Increase severity if action is irreversible
    if (!action.reversible) {
      severity += 3;
    }

    return Math.min(10, severity); // Cap at 10
  }

  /**
   * Get all violations
   */
  public getViolations(filter?: {
    minSeverity?: number;
    constraintType?: ConstraintType;
    since?: Date;
  }): Violation[] {
    let filtered = [...this.violations];

    if (filter?.minSeverity) {
      filtered = filtered.filter(v => v.severity >= filter.minSeverity);
    }

    if (filter?.constraintType) {
      filtered = filtered.filter(v => v.constraint.type === filter.constraintType);
    }

    if (filter?.since) {
      filtered = filtered.filter(v => v.timestamp >= filter.since);
    }

    return filtered;
  }

  /**
   * Get all constraints
   */
  public getConstraints(): EthicalConstraint[] {
    return Array.from(this.constraints.values());
  }

  /**
   * Remove a constraint
   */
  public removeConstraint(constraintId: string): boolean {
    const result = this.constraints.delete(constraintId);
    if (result) {
      this.emit('constraint_removed', constraintId);
    }
    return result;
  }

  /**
   * Get ethical compliance summary
   */
  public getComplianceSummary(): ComplianceSummary {
    const totalActions = this.actions.size;
    const totalViolations = this.violations.length;
    const complianceRate = totalActions > 0 
      ? ((totalActions - totalViolations) / totalActions) * 100 
      : 100;

    return {
      totalActions,
      totalViolations,
      totalConstraints: this.constraints.size,
      complianceRate,
      criticalViolations: this.violations.filter(v => v.severity >= 8).length,
      lastViolation: this.violations[this.violations.length - 1] || null,
    };
  }
}

export interface ValidationResult {
  valid: boolean;
  violations: Violation[];
  action: Action;
}

export interface ComplianceSummary {
  totalActions: number;
  totalViolations: number;
  totalConstraints: number;
  complianceRate: number;
  criticalViolations: number;
  lastViolation: Violation | null;
}
