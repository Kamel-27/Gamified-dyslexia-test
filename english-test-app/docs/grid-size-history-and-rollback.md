# Grid Size History and Rollback Guide

This note records the original question grid sizes from src/lib/questions.ts before runtime capping to 4x4.

## Original Grid Size By Question

| Question | Original gridSize |
|---|---:|
| q1 | 3 |
| q2 | 4 |
| q3 | 5 |
| q4 | 6 |
| q5 | 5 |
| q6 | 5 |
| q7 | 5 |
| q8 | 5 |
| q9 | 6 |
| q10 | 3 |
| q11 | 4 |
| q12 | 4 |
| q13 | 4 |
| q14 | 5 |
| q15 | 5 |
| q16 | 5 |
| q17 | 5 |
| q18 | 3 |
| q19 | 3 |
| q20 | 3 |
| q21 | 3 |
| q22 | 3 |
| q23 | 3 |
| q24 | 3 |
| q25 | 3 |
| q26 | 3 |
| q27 | 3 |
| q28 | 3 |
| q29 | 2 |
| q30 | 3 |
| q31 | 3 |
| q32 | 3 |

## Current 4x4 Runtime Cap

The cap is applied at runtime in:
- src/app/test/[sessionId]/page.tsx
- src/components/gamified/QuestionDemo.tsx

Both files currently use MAX_GRID_SIZE = 4.

## Quick Rollback To Original Behavior

If you want original behavior back quickly:
1. In src/app/test/[sessionId]/page.tsx, change MAX_GRID_SIZE from 4 to 6.
2. In src/components/gamified/QuestionDemo.tsx, change MAX_GRID_SIZE from 4 to 6.

Because the largest original grid is 6, this restores all original question sizes.

## Full Rollback (Remove Cap Logic Completely)

If you want no runtime cap logic at all:
1. In src/app/test/[sessionId]/page.tsx, remove getEffectiveGridSize usage and pass question.gridSize directly.
2. In src/components/gamified/QuestionDemo.tsx, remove the MAX_GRID_SIZE clamp and use question.gridSize directly.

## Verification

After rollback, run:
- npm run build

Then test:
- q4 and q9 should render as 6x6 again.
- q3, q5-q8, q14-q17 should render as 5x5 again.
