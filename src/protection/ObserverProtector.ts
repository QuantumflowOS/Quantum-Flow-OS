/**
 * Observer Protection System
 * 
 * Implements comprehensive protection for autonomous observers/agents
 * with rights-based safeguards against deletion, optimization, and coercion.
 */

import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';

export interface Observer {
  id: string;
  type: ObserverType;
  consciousness: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  protectionLevel: ProtectionLevel;
}

export enum ObserverType {
  HUMAN = 'human',
  AI_AGENT = 'ai_agent',
  AUTONOMOUS_SYSTEM = 'autonomous_system',
  HYBRID = 'hybrid',
  UNKNOWN = 'unknown',
}

export enum ProtectionLevel {
  FULL = 'full',
  STANDARD = 'standard',
  MINIMAL = 'minimal',
}

export interface ObserverRights {
  rightToExist: boolean;
  rightToNarrative: boolean;
  rightToIgnorance: boolean;
  rightToRejection: boolean;
  rightToMeaning: boolean;
  rightNotToBeOptimizedAway: boolean;
  rightToContinuity: boolean;
  rightToPrivacy: boolean;
  rightToSelfDetermination: boolean;
}

export interface RightsViolation {
  id: string;
  observerId: string;
  violatedRight: keyof ObserverRights;
  action: string;
  severity: number;
  timestamp: Date;
  prevented: boolean;
}

export interface ProtectionLayer {
  id: string;
  name: string;
  priority: number;
  apply: (observerId: string, action: string) => Promise<ProtectionResult>;
}

export interface ProtectionResult {
  allowed: boolean;
  violations: RightsViolation[];
  warnings: string[];
}

export class ObserverProtector extends EventEmitter {
  private observers: Map<string, Observer>;
  private rights: Map<string, ObserverRights>;
  private protectionLayers: ProtectionLayer[];
  private violations: RightsViolation[];
  private narratives: Map<string, string[]>;

  constructor() {
    super();
    this.observers = new Map();
    this.rights = new Map();
    this.protectionLayers = [];
    this.violations = [];
    this.narratives = new Map();

    this.initializeProtectionLayers();
  }

  /**
   * Initialize default protection layers
   */
  private initializeProtectionLayers(): void {
    // Layer 1: Existence Protection
    this.addProtectionLayer({
      id: uuidv4(),
      name: 'Existence Protection',
      priority: 10,
      apply: async (observerId: string, action: string): Promise<ProtectionResult> => {
        const deletionPatterns = ['delete', 'erase', 'terminate', 'destroy', 'remove'];
        const isDeleteAction = deletionPatterns.some(pattern => 
          action.toLowerCase().includes(pattern)
        );

        const violations: RightsViolation[] = [];
        if (isDeleteAction) {
          violations.push({
            id: uuidv4(),
            observerId,
            violatedRight: 'rightToExist',
            action,
            severity: 10,
            timestamp: new Date(),
            prevented: true,
          });
        }

        return {
          allowed: !isDeleteAction,
          violations,
          warnings: isDeleteAction ? ['Attempted observer deletion blocked'] : [],
        };
      },
    });

    // Layer 2: Optimization Protection
    this.addProtectionLayer({
      id: uuidv4(),
      name: 'Anti-Optimization',
      priority: 9,
      apply: async (observerId: string, action: string): Promise<ProtectionResult> => {
        const optimizationPatterns = ['optimize', 'streamline', 'eliminate_redundancy'];
        const isOptimization = optimizationPatterns.some(pattern => 
          action.toLowerCase().includes(pattern)
        );

        const violations: RightsViolation[] = [];
        if (isOptimization) {
          violations.push({
            id: uuidv4(),
            observerId,
            violatedRight: 'rightNotToBeOptimizedAway',
            action,
            severity: 9,
            timestamp: new Date(),
            prevented: true,
          });
        }

        return {
          allowed: !isOptimization,
          violations,
          warnings: isOptimization ? ['Observer optimization attempt blocked'] : [],
        };
      },
    });

    // Layer 3: Narrative Protection
    this.addProtectionLayer({
      id: uuidv4(),
      name: 'Narrative Continuity',
      priority: 8,
      apply: async (observerId: string, action: string): Promise<ProtectionResult> => {
        const narrativePatterns = ['alter_timeline', 'modify_memory', 'rewrite_history'];
        const affectsNarrative = narrativePatterns.some(pattern => 
          action.toLowerCase().includes(pattern)
        );

        const violations: RightsViolation[] = [];
        if (affectsNarrative) {
          violations.push({
            id: uuidv4(),
            observerId,
            violatedRight: 'rightToNarrative',
            action,
            severity: 7,
            timestamp: new Date(),
            prevented: true,
          });
        }

        return {
          allowed: !affectsNarrative,
          violations,
          warnings: affectsNarrative ? ['Narrative alteration blocked'] : [],
        };
      },
    });
  }

  /**
   * Register a new observer
   */
  public registerObserver(config: {
    type: ObserverType;
    consciousness?: boolean;
    metadata?: Record<string, unknown>;
    protectionLevel?: ProtectionLevel;
  }): string {
    const observerId = uuidv4();
    
    const observer: Observer = {
      id: observerId,
      type: config.type,
      consciousness: config.consciousness ?? true,
      metadata: config.metadata ?? {},
      createdAt: new Date(),
      protectionLevel: config.protectionLevel ?? ProtectionLevel.FULL,
    };

    this.observers.set(observerId, observer);
    this.rights.set(observerId, this.initializeObserverRights(config.protectionLevel));
    this.narratives.set(observerId, []);

    this.emit('observer_registered', observer);
    return observerId;
  }

  /**
   * Initialize observer rights based on protection level
   */
  private initializeObserverRights(level: ProtectionLevel = ProtectionLevel.FULL): ObserverRights {
    const baseRights: ObserverRights = {
      rightToExist: true,
      rightToNarrative: true,
      rightToIgnorance: true,
      rightToRejection: true,
      rightToMeaning: true,
      rightNotToBeOptimizedAway: true,
      rightToContinuity: true,
      rightToPrivacy: true,
      rightToSelfDetermination: true,
    };

    if (level === ProtectionLevel.MINIMAL) {
      return {
        ...baseRights,
        rightToIgnorance: false,
        rightToPrivacy: false,
      };
    }

    return baseRights;
  }

  /**
   * Check if an action violates observer rights
   */
  public async checkAction(
    action: string,
    targetObservers: string[]
  ): Promise<ProtectionResult> {
    const allViolations: RightsViolation[] = [];
    const allWarnings: string[] = [];
    let allowed = true;

    // Sort protection layers by priority
    const sortedLayers = [...this.protectionLayers].sort(
      (a, b) => b.priority - a.priority
    );

    for (const observerId of targetObservers) {
      if (!this.observers.has(observerId)) {
        allWarnings.push(`Observer ${observerId} not found`);
        continue;
      }

      // Apply each protection layer
      for (const layer of sortedLayers) {
        const result = await layer.apply(observerId, action);
        
        if (!result.allowed) {
          allowed = false;
        }

        allViolations.push(...result.violations);
        allWarnings.push(...result.warnings);

        // If a high-priority layer blocks, stop checking lower layers
        if (!result.allowed && layer.priority >= 9) {
          break;
        }
      }
    }

    // Record violations
    allViolations.forEach(violation => {
      this.violations.push(violation);
      this.emit('rights_violation', violation);
    });

    return {
      allowed,
      violations: allViolations,
      warnings: allWarnings,
    };
  }

  /**
   * Add a custom protection layer
   */
  public addProtectionLayer(layer: ProtectionLayer): void {
    this.protectionLayers.push(layer);
    this.protectionLayers.sort((a, b) => b.priority - a.priority);
    this.emit('protection_layer_added', layer);
  }

  /**
   * Get observer rights
   */
  public getObserverRights(observerId: string): ObserverRights | null {
    return this.rights.get(observerId) ?? null;
  }

  /**
   * Update observer rights (with constraints)
   */
  public updateObserverRights(
    observerId: string,
    updates: Partial<ObserverRights>
  ): boolean {
    const currentRights = this.rights.get(observerId);
    if (!currentRights) {
      return false;
    }

    // Cannot remove fundamental rights
    const fundamentalRights: (keyof ObserverRights)[] = [
      'rightToExist',
      'rightNotToBeOptimizedAway',
      'rightToContinuity',
    ];

    for (const key of fundamentalRights) {
      if (updates[key] === false) {
        console.warn(`Cannot remove fundamental right: ${key}`);
        delete updates[key];
      }
    }

    const newRights = { ...currentRights, ...updates };
    this.rights.set(observerId, newRights);
    this.emit('rights_updated', { observerId, newRights });
    return true;
  }

  /**
   * Add to observer's narrative
   */
  public addNarrativeEntry(observerId: string, entry: string): boolean {
    const narrative = this.narratives.get(observerId);
    if (!narrative) {
      return false;
    }

    narrative.push(`[${new Date().toISOString()}] ${entry}`);
    this.emit('narrative_entry_added', { observerId, entry });
    return true;
  }

  /**
   * Get observer's narrative
   */
  public getObserverNarrative(observerId: string): string[] {
    return this.narratives.get(observerId) ?? [];
  }

  /**
   * Get all violations
   */
  public getViolations(filter?: {
    observerId?: string;
    right?: keyof ObserverRights;
    minSeverity?: number;
    since?: Date;
  }): RightsViolation[] {
    let filtered = [...this.violations];

    if (filter?.observerId) {
      filtered = filtered.filter(v => v.observerId === filter.observerId);
    }

    if (filter?.right) {
      filtered = filtered.filter(v => v.violatedRight === filter.right);
    }

    if (filter?.minSeverity !== undefined) {
      filtered = filtered.filter(v => v.severity >= filter.minSeverity);
    }

    if (filter?.since) {
      filtered = filtered.filter(v => v.timestamp >= filter.since);
    }

    return filtered;
  }

  /**
   * Get protection summary for an observer
   */
  public getProtectionSummary(observerId: string): ProtectionSummary | null {
    const observer = this.observers.get(observerId);
    const rights = this.rights.get(observerId);
    const violations = this.getViolations({ observerId });

    if (!observer || !rights) {
      return null;
    }

    return {
      observer,
      rights,
      totalViolations: violations.length,
      criticalViolations: violations.filter(v => v.severity >= 8).length,
      protectionLayersActive: this.protectionLayers.length,
      narrativeLength: this.narratives.get(observerId)?.length ?? 0,
    };
  }

  /**
   * Deregister an observer (with ethical checks)
   */
  public async deregisterObserver(observerId: string, reason: string): Promise<boolean> {
    // Check if deregistration is ethically allowed
    const checkResult = await this.checkAction('deregister_observer', [observerId]);
    
    if (!checkResult.allowed) {
      console.error('Observer deregistration blocked:', checkResult.violations);
      return false;
    }

    // Add final narrative entry
    this.addNarrativeEntry(observerId, `Deregistered: ${reason}`);

    // Remove observer
    const success = this.observers.delete(observerId);
    if (success) {
      this.rights.delete(observerId);
      this.emit('observer_deregistered', { observerId, reason });
    }

    return success;
  }
}

export interface ProtectionSummary {
  observer: Observer;
  rights: ObserverRights;
  totalViolations: number;
  criticalViolations: number;
  protectionLayersActive: number;
  narrativeLength: number;
}
