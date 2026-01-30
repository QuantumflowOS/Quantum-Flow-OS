/**
 * Quantum Flow OS - Ethical Ontology Framework
 * Version 14.0.0
 * 
 * Main entry point for the framework
 */

// Core Engine
export {
  SelfConstrainingEngine,
  ConstraintType,
  type EthicalConstraint,
  type Action,
  type Violation,
  type RollbackProcedure,
  type ValidationResult,
  type ComplianceSummary,
} from './core/SelfConstrainingEngine';

// Observer Protection
export {
  ObserverProtector,
  ObserverType,
  ProtectionLevel,
  type Observer,
  type ObserverRights,
  type RightsViolation,
  type ProtectionLayer,
  type ProtectionResult,
  type ProtectionSummary,
} from './protection/ObserverProtector';

// Reversibility
export {
  ReversibilityEngine,
  type ReversibleAction,
  type ActionSnapshot,
  type RollbackOptions,
  type ExecutionResult,
  type RollbackRecord,
  type RollbackBatchResult,
  type ReversibilityStatus,
} from './reversibility/ReversibilityEngine';

/**
 * Create a fully configured Quantum Flow OS instance
 */
import { SelfConstrainingEngine } from './core/SelfConstrainingEngine';
import { ObserverProtector } from './protection/ObserverProtector';
import { ReversibilityEngine } from './reversibility/ReversibilityEngine';

export interface QuantumFlowConfig {
  autoRollback?: boolean;
  maxHistorySize?: number;
  strictMode?: boolean;
}

export class QuantumFlowOS {
  public readonly constraintEngine: SelfConstrainingEngine;
  public readonly observerProtector: ObserverProtector;
  public readonly reversibilityEngine: ReversibilityEngine;
  private readonly strictMode: boolean;

  constructor(config: QuantumFlowConfig = {}) {
    this.strictMode = config.strictMode ?? true;
    
    this.constraintEngine = new SelfConstrainingEngine({
      autoRollback: config.autoRollback ?? true,
    });

    this.observerProtector = new ObserverProtector();

    this.reversibilityEngine = new ReversibilityEngine({
      maxHistorySize: config.maxHistorySize ?? 1000,
    });

    this.setupIntegrations();
  }

  /**
   * Setup integrations between components
   */
  private setupIntegrations(): void {
    // Link constraint engine violations to observer protector
    this.constraintEngine.on('violation_recorded', (violation) => {
      if (violation.action.targetObservers) {
        this.observerProtector.checkAction(
          violation.action.type,
          violation.action.targetObservers
        );
      }
    });

    // Link rollback failures to constraint engine
    this.reversibilityEngine.on('rollback_failed', (record) => {
      console.error(`Ethical concern: Rollback failed for ${record.actionName}`);
    });
  }

  /**
   * Get overall system health
   */
  public getSystemHealth(): SystemHealth {
    const compliance = this.constraintEngine.getComplianceSummary();
    const reversibility = this.reversibilityEngine.getReversibilityStatus();

    return {
      ethicalCompliance: compliance.complianceRate,
      rollbackSuccess: reversibility.rollbackSuccessRate,
      activeConstraints: compliance.totalConstraints,
      criticalViolations: compliance.criticalViolations,
      reversibilityEnabled: reversibility.hasSnapshots,
      systemStatus: this.determineSystemStatus(compliance, reversibility),
    };
  }

  /**
   * Determine overall system status
   */
  private determineSystemStatus(
    compliance: any,
    reversibility: any
  ): 'healthy' | 'warning' | 'critical' {
    if (compliance.criticalViolations > 0) {
      return 'critical';
    }

    if (
      compliance.complianceRate < 95 ||
      reversibility.rollbackSuccessRate < 90
    ) {
      return 'warning';
    }

    return 'healthy';
  }

  /**
   * Emergency shutdown with full rollback
   */
  public async emergencyShutdown(): Promise<void> {
    console.log('Initiating emergency shutdown with full rollback...');
    
    // Rollback all actions from the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    await this.reversibilityEngine.rollbackSince(oneHourAgo);

    console.log('Emergency shutdown complete');
  }
}

export interface SystemHealth {
  ethicalCompliance: number;
  rollbackSuccess: number;
  activeConstraints: number;
  criticalViolations: number;
  reversibilityEnabled: boolean;
  systemStatus: 'healthy' | 'warning' | 'critical';
}

// Default export
export default QuantumFlowOS;
