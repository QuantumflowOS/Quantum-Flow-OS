/**
 * Reversibility Engine
 * 
 * Provides comprehensive rollback capabilities for all operations.
 * Ensures ethical compliance through state tracking and recovery mechanisms.
 */

import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';

export interface ReversibleAction<T = unknown> {
  id: string;
  name: string;
  execute: () => Promise<T>;
  rollback: () => Promise<void>;
  metadata: Record<string, unknown>;
  timestamp: Date;
  completed: boolean;
  rolledBack: boolean;
}

export interface ActionSnapshot {
  actionId: string;
  beforeState: unknown;
  afterState: unknown;
  timestamp: Date;
}

export interface RollbackOptions {
  maxAttempts?: number;
  timeoutMs?: number;
  onError?: (error: Error) => void;
  validateBeforeRollback?: (snapshot: ActionSnapshot) => boolean;
}

export class ReversibilityEngine extends EventEmitter {
  private actions: Map<string, ReversibleAction>;
  private snapshots: Map<string, ActionSnapshot>;
  private rollbackHistory: RollbackRecord[];
  private maxHistorySize: number;

  constructor(options: { maxHistorySize?: number } = {}) {
    super();
    this.actions = new Map();
    this.snapshots = new Map();
    this.rollbackHistory = [];
    this.maxHistorySize = options.maxHistorySize ?? 1000;
  }

  /**
   * Execute an action with automatic rollback capability
   */
  public async executeWithRollback<T>(
    action: Omit<ReversibleAction<T>, 'id' | 'timestamp' | 'completed' | 'rolledBack'>,
    options: RollbackOptions = {}
  ): Promise<ExecutionResult<T>> {
    const actionId = uuidv4();
    const reversibleAction: ReversibleAction<T> = {
      ...action,
      id: actionId,
      timestamp: new Date(),
      completed: false,
      rolledBack: false,
    };

    this.actions.set(actionId, reversibleAction as ReversibleAction);

    const {
      maxAttempts = 3,
      timeoutMs = 30000,
      onError,
      validateBeforeRollback,
    } = options;

    let lastError: Error | null = null;
    let result: T | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Execute with timeout
        result = await this.executeWithTimeout(
          reversibleAction.execute,
          timeoutMs
        );

        // Mark as completed
        reversibleAction.completed = true;
        this.emit('action_completed', { actionId, result });

        return {
          success: true,
          actionId,
          result: result as T,
          attempts: attempt,
        };
      } catch (error) {
        lastError = error as Error;
        this.emit('action_error', { actionId, error, attempt });

        if (onError) {
          onError(lastError);
        }

        // Attempt rollback if not the last attempt
        if (attempt < maxAttempts) {
          await this.rollbackAction(actionId, { validateBeforeRollback });
        }
      }
    }

    // All attempts failed - perform final rollback
    await this.rollbackAction(actionId, { validateBeforeRollback });

    return {
      success: false,
      actionId,
      error: lastError ?? new Error('Unknown error'),
      attempts: maxAttempts,
    };
  }

  /**
   * Execute a function with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
      ),
    ]);
  }

  /**
   * Create a snapshot before executing an action
   */
  public createSnapshot(actionId: string, beforeState: unknown): void {
    const snapshot: ActionSnapshot = {
      actionId,
      beforeState,
      afterState: null,
      timestamp: new Date(),
    };

    this.snapshots.set(actionId, snapshot);
    this.emit('snapshot_created', snapshot);
  }

  /**
   * Update snapshot after action execution
   */
  public updateSnapshot(actionId: string, afterState: unknown): void {
    const snapshot = this.snapshots.get(actionId);
    if (snapshot) {
      snapshot.afterState = afterState;
      this.emit('snapshot_updated', snapshot);
    }
  }

  /**
   * Rollback a specific action
   */
  public async rollbackAction(
    actionId: string,
    options: Pick<RollbackOptions, 'validateBeforeRollback'> = {}
  ): Promise<boolean> {
    const action = this.actions.get(actionId);
    if (!action) {
      console.warn(`Action ${actionId} not found for rollback`);
      return false;
    }

    if (action.rolledBack) {
      console.warn(`Action ${actionId} already rolled back`);
      return false;
    }

    // Validate before rollback if validator provided
    if (options.validateBeforeRollback) {
      const snapshot = this.snapshots.get(actionId);
      if (snapshot && !options.validateBeforeRollback(snapshot)) {
        console.error('Rollback validation failed');
        return false;
      }
    }

    try {
      this.emit('rollback_started', actionId);
      await action.rollback();
      
      action.rolledBack = true;
      action.completed = false;

      // Record rollback
      const record: RollbackRecord = {
        id: uuidv4(),
        actionId,
        actionName: action.name,
        timestamp: new Date(),
        success: true,
      };

      this.addRollbackRecord(record);
      this.emit('rollback_completed', record);

      return true;
    } catch (error) {
      const record: RollbackRecord = {
        id: uuidv4(),
        actionId,
        actionName: action.name,
        timestamp: new Date(),
        success: false,
        error: error as Error,
      };

      this.addRollbackRecord(record);
      this.emit('rollback_failed', record);

      return false;
    }
  }

  /**
   * Rollback multiple actions in reverse order
   */
  public async rollbackActions(
    actionIds: string[],
    options: RollbackOptions = {}
  ): Promise<RollbackBatchResult> {
    const results: { actionId: string; success: boolean }[] = [];

    // Rollback in reverse order (LIFO)
    for (const actionId of [...actionIds].reverse()) {
      const success = await this.rollbackAction(actionId, options);
      results.push({ actionId, success });

      if (!success && options.onError) {
        options.onError(new Error(`Rollback failed for action ${actionId}`));
      }
    }

    const successCount = results.filter(r => r.success).length;

    return {
      total: actionIds.length,
      succeeded: successCount,
      failed: actionIds.length - successCount,
      results,
    };
  }

  /**
   * Rollback all actions since a specific point in time
   */
  public async rollbackSince(
    timestamp: Date,
    options: RollbackOptions = {}
  ): Promise<RollbackBatchResult> {
    const actionsToRollback = Array.from(this.actions.values())
      .filter(action => action.timestamp >= timestamp && !action.rolledBack)
      .map(action => action.id);

    return this.rollbackActions(actionsToRollback, options);
  }

  /**
   * Add rollback record to history
   */
  private addRollbackRecord(record: RollbackRecord): void {
    this.rollbackHistory.push(record);

    // Maintain max history size
    if (this.rollbackHistory.length > this.maxHistorySize) {
      this.rollbackHistory.shift();
    }
  }

  /**
   * Get rollback history
   */
  public getRollbackHistory(filter?: {
    since?: Date;
    successOnly?: boolean;
    actionId?: string;
  }): RollbackRecord[] {
    let filtered = [...this.rollbackHistory];

    if (filter?.since) {
      filtered = filtered.filter(r => r.timestamp >= filter.since!);
    }

    if (filter?.successOnly) {
      filtered = filtered.filter(r => r.success);
    }

    if (filter?.actionId) {
      filtered = filtered.filter(r => r.actionId === filter.actionId);
    }

    return filtered;
  }

  /**
   * Get reversibility status
   */
  public getReversibilityStatus(): ReversibilityStatus {
    const allActions = Array.from(this.actions.values());
    const completed = allActions.filter(a => a.completed && !a.rolledBack).length;
    const rolledBack = allActions.filter(a => a.rolledBack).length;
    const pending = allActions.filter(a => !a.completed && !a.rolledBack).length;

    const totalRollbacks = this.rollbackHistory.length;
    const successfulRollbacks = this.rollbackHistory.filter(r => r.success).length;
    const rollbackSuccessRate = totalRollbacks > 0
      ? (successfulRollbacks / totalRollbacks) * 100
      : 100;

    return {
      totalActions: allActions.length,
      completedActions: completed,
      rolledBackActions: rolledBack,
      pendingActions: pending,
      totalRollbacks,
      successfulRollbacks,
      failedRollbacks: totalRollbacks - successfulRollbacks,
      rollbackSuccessRate,
      hasSnapshots: this.snapshots.size > 0,
    };
  }

  /**
   * Clear old actions and snapshots
   */
  public cleanup(olderThan: Date): number {
    let cleaned = 0;

    // Clean actions
    for (const [id, action] of this.actions) {
      if (action.timestamp < olderThan && (action.completed || action.rolledBack)) {
        this.actions.delete(id);
        this.snapshots.delete(id);
        cleaned++;
      }
    }

    this.emit('cleanup_completed', { cleaned, olderThan });
    return cleaned;
  }

  /**
   * Get action details
   */
  public getAction(actionId: string): ReversibleAction | null {
    return this.actions.get(actionId) ?? null;
  }

  /**
   * Get snapshot
   */
  public getSnapshot(actionId: string): ActionSnapshot | null {
    return this.snapshots.get(actionId) ?? null;
  }
}

export interface ExecutionResult<T> {
  success: boolean;
  actionId: string;
  result?: T;
  error?: Error;
  attempts: number;
}

export interface RollbackRecord {
  id: string;
  actionId: string;
  actionName: string;
  timestamp: Date;
  success: boolean;
  error?: Error;
}

export interface RollbackBatchResult {
  total: number;
  succeeded: number;
  failed: number;
  results: { actionId: string; success: boolean }[];
}

export interface ReversibilityStatus {
  totalActions: number;
  completedActions: number;
  rolledBackActions: number;
  pendingActions: number;
  totalRollbacks: number;
  successfulRollbacks: number;
  failedRollbacks: number;
  rollbackSuccessRate: number;
  hasSnapshots: boolean;
}
