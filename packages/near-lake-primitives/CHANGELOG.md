# @near-lake/primitives

## 0.5.0

### Minor Changes

- [#61](https://github.com/near/near-lake-framework-js/pull/61) [`7971e995b52dfbc764dba607e9fd40dea5ca0ef0`](https://github.com/near/near-lake-framework-js/commit/7971e995b52dfbc764dba607e9fd40dea5ca0ef0) Thanks [@pkudinov](https://github.com/pkudinov)! - Added:

  - `Block.functionCalls` to get an array of FunctionCallView in this block, with different filters
  - `Block.functionCallsToReceiver` to get an array of FunctionCallView to a specific receiver, optionally specifying method name
  - `FunctionCallView` type that provides complete information about the function call, including parsed arguments and events

  Changed:

  - `Event` class has been changed to inline RawEvent fields.

## 0.4.0

### Minor Changes

- [#57](https://github.com/near/near-lake-framework-js/pull/57) [`25ccd87bfca3e7d1a903935425597a9f458c55d8`](https://github.com/near/near-lake-framework-js/commit/25ccd87bfca3e7d1a903935425597a9f458c55d8) Thanks [@morgsmccauley](https://github.com/morgsmccauley)! - Ensure `borsh` export is accessible within published package

## 0.3.0

### Minor Changes

- [#55](https://github.com/near/near-lake-framework-js/pull/55) [`da497697fe46694e0cd3ea4f89f4905dc9422b11`](https://github.com/near/near-lake-framework-js/commit/da497697fe46694e0cd3ea4f89f4905dc9422b11) Thanks [@morgsmccauley](https://github.com/morgsmccauley)! - Scope borsh exports under `borsh`

## 0.2.0

### Minor Changes

- [#53](https://github.com/near/near-lake-framework-js/pull/53) [`639de27fe9de798ad101bc7812ea38e6cf9cd5b5`](https://github.com/near/near-lake-framework-js/commit/639de27fe9de798ad101bc7812ea38e6cf9cd5b5) Thanks [@Tguntenaar](https://github.com/Tguntenaar)! - deserialization is now supported using borsh-js

## 0.1.1

### Patch Changes

- [#43](https://github.com/near/near-lake-framework-js/pull/43) [`332f4bb`](https://github.com/near/near-lake-framework-js/commit/332f4bb8f183cd5660e376f0c01b2d27cf6f8b5c) Thanks [@morgsmccauley](https://github.com/morgsmccauley)! - event logs are now parsed correctly

## 0.1.0

### Minor Changes

- initial release of @near-lake/
