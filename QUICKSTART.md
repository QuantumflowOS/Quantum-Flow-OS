# Quick Start Guide

Get up and running with Quantum Flow OS in 5 minutes!

## Installation

```bash
# Clone or download the project
cd quantum-flow-os

# Install dependencies
npm install

# Build the project
npm run build
```

## Your First Program

Create a file `my-first-ethical-system.ts`:

```typescript
import { QuantumFlowOS, ObserverType } from './src/index';

async function main() {
  // 1. Initialize the system
  const qfos = new QuantumFlowOS({
    autoRollback: true,
    strictMode: true,
  });

  // 2. Register an observer
  const observerId = qfos.observerProtector.registerObserver({
    type: ObserverType.AI_AGENT,
    consciousness: true,
  });

  // 3. Try to validate an action
  const action = {
    id: 'action-1',
    type: 'helpful_task',
    description: 'Perform a helpful task',
    reversible: true,
    metadata: {},
    timestamp: new Date(),
  };

  const result = qfos.constraintEngine.validateAction(action);
  
  console.log('Action valid:', result.valid);
  console.log('Violations:', result.violations.length);

  // 4. Check system health
  const health = qfos.getSystemHealth();
  console.log('System status:', health.systemStatus);
  console.log('Compliance rate:', health.ethicalCompliance.toFixed(2) + '%');
}

main();
```

Run it:

```bash
npx ts-node my-first-ethical-system.ts
```

## Run Examples

```bash
# Basic usage
npx ts-node examples/basic-usage.ts

# Observer protection
npx ts-node examples/observer-protection.ts
```

## Run Tests

```bash
# All tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Common Patterns

### 1. Validate Before Acting

```typescript
const action = createAction();
const validation = engine.validateAction(action);

if (validation.valid) {
  await performAction();
} else {
  console.error('Action blocked:', validation.violations);
}
```

### 2. Protect Observers

```typescript
const observerId = protector.registerObserver({
  type: ObserverType.HUMAN,
  consciousness: true,
  protectionLevel: ProtectionLevel.FULL,
});

// Check before acting on observer
const result = await protector.checkAction('some_action', [observerId]);
if (!result.allowed) {
  console.error('Observer protection prevented action');
}
```

### 3. Use Reversible Operations

```typescript
const result = await reversibilityEngine.executeWithRollback({
  name: 'risky_operation',
  execute: async () => {
    // Do something
    return result;
  },
  rollback: async () => {
    // Undo it
  },
}, {
  maxAttempts: 3,
});

if (!result.success) {
  console.error('Operation failed and was rolled back');
}
```

## Next Steps

- Read the [full documentation](./README.md)
- Explore [ethical principles](./docs/ETHICS.md)
- Check out [contributing guide](./CONTRIBUTING.md)
- Review the [API documentation](./src/index.ts)

## Getting Help

- 📚 Check the `/examples` directory
- 📖 Read the `/docs` directory
- 💬 Open a GitHub Discussion
- 🐛 Report issues on GitHub

Happy ethical coding! 🌟
