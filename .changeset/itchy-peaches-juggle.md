---
"@near-lake/primitives": minor
---

Added:
- `Block.functionCalls` to get an array of FunctionCallView in this block, with different filters
- `Block.functionCallsToReceiver` to get an array of FunctionCallView to a specific receiver, optionally specifying method name
- `FunctionCallView` type that provides complete information about the function call, including parsed arguments and events

Changed:
- `Event` class has been changed to inline RawEvent fields.
