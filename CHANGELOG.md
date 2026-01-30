# Changelog

All notable changes to the Quantum Flow OS project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [14.0.0] - 2026-01-30

### Added
- Complete rewrite in TypeScript with full type safety
- Modern build system with npm and TypeScript compiler
- Comprehensive test suite with Jest
- `SelfConstrainingEngine` - Core ethical constraint system
- `ObserverProtector` - Rights-based protection for autonomous observers
- `ReversibilityEngine` - Full rollback capabilities for all operations
- `QuantumFlowOS` - Main framework class integrating all components
- Event-driven architecture using EventEmitter3
- Detailed inline documentation and JSDoc comments
- Example implementations in `examples/` directory
- ESLint and Prettier for code quality
- Comprehensive `package.json` with proper scripts

### Changed
- Migrated from bash scripts to TypeScript classes
- Improved error handling with proper TypeScript types
- Enhanced constraint validation with type-safe validators
- Reorganized project structure for better maintainability
- Updated documentation to reflect TypeScript implementation

### Improved
- Better separation of concerns between components
- More robust error handling and recovery mechanisms
- Clearer API with TypeScript interfaces
- Performance optimizations in constraint checking
- More comprehensive test coverage

### Security
- Type-safe validation of all actions
- Protection against observer deletion and optimization
- Non-coercive constraint enforcement
- Rollback mechanisms for all state changes

## [13.0.0] - Previous Version

### Context
- Original philosophical framework implementation
- Bash-based build system
- JavaScript implementations
- Theoretical ethical ontology concepts

---

## Migration Guide from v13.0.0 to v14.0.0

### Breaking Changes

1. **TypeScript Required**: The project now requires TypeScript for development
2. **API Changes**: All APIs now use TypeScript classes instead of procedural functions
3. **Import Changes**: Module imports have changed to use named exports

### Migration Steps

```typescript
// Old (v13.0.0)
const engine = createEngine();

// New (v14.0.0)
import { SelfConstrainingEngine } from '@quantum-flow/ethical-ontology';
const engine = new SelfConstrainingEngine();
```

### Benefits

- Full type safety
- Better IDE support
- Improved documentation
- More maintainable code
- Better testing capabilities
