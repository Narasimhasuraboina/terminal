# Camera Kinematics & Waypoint System

The camera management system provides smooth cinematic interpolation between presets and free orbital control.

## Kinematic Model
- Uses spherical coordinates (`radius`, `phi`, `theta`) mapped around a variable target point `target`.
- Clamped polar angle: `minPolarAngle = 0.1 rad`, `maxPolarAngle = 1.62 rad` (prevents camera from inverting below the floor grid).
- Distance boundaries: `minDistance = 12 units`, `maxDistance = 160 units`.

## Waypoint Transitions
- Interpolation powered by `TWEEN.Tween`.
- Easing Curve: `TWEEN.Easing.Cubic.InOut`.
- Duration: Normalized to `1200ms` for cinematic transitions, preventing disorienting cuts.
- Simultaneous target and eye coordinate tweening ensures smooth visual focal tracking during flight.
