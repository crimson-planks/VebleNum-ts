# VebleNum-ts
A javascript library for handling ordinals &lt; psi(&Omega;^&Omega;^&omega;) (which ordinal collapsing function is this??? Please open an issue) (Small Veblen Ordinal)

Forked from [https://github.com/Reinhardt-C/VebleNum.js](https://github.com/Reinhardt-C/VebleNum.js)

## Differences from VebleNum.js
### 2.0.0
- Removed `[ntfnSymbol]` properties from numbers and bigints
- The functions now get its ntfna (previously ntfnObj) as the first argument
- Fixed `phi(0)` returning 0 (expected: 1)
- `phi()` now returns 1
- fix fromString(toString(x)) breaking when the finite numeric becomes too large that it is displayed in e notation.
- 

### 1.0.0
- Allows for custom numeric objects if you define the `[ntfnSymbol]` property
- Fixed lte always returning `false`
- Allows the user to escape numeric literals to avoid collisions with latin-lookalike ordinal inputs