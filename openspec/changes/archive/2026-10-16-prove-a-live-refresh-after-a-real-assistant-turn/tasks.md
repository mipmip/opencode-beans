## 1. Local provider for the harness

- [x] 1.1 Add `e2e/helpers/mock-provider.ts` exposing a start function that listens on an ephemeral loopback port, answers `GET /v1/models` and `POST /v1/chat/completions` with a canned assistant message, and returns the base URL, an await for the agent request, a release function and a close function. Verify: a unit test drives the server over HTTP and sees the canned message.
- [x] 1.2 Answer the title generation request immediately and hold only the agent request. Verify: the unit test asserts the title request returns without a release and the agent request waits for one.

## 2. Fixture provider configuration

- [x] 2.1 Extend `e2e/helpers/project.ts` with an option that writes an `opencode.jsonc` naming the local provider, its model, the model as the default, and the provider key in the environment. Verify: an assertion in the live case reads the config back and finds the provider.
- [x] 2.2 Keep the option off by default so the existing cases are unchanged. Verify: the existing end to end cases still pass.

## 3. Live refresh case

- [x] 3.1 Add `e2e/beans-live-refresh.test.ts` that starts the provider, boots the terminal in a pseudo terminal with a prompt, waits for the agent request, adds a bean, releases the completion, and asserts the reconstructed sidebar shows the new total. Verify: `npm run test:e2e` passes with the new case.
- [x] 3.2 Assert the canned assistant text is on screen so a turn is proven to have run. Verify: the same case fails when the provider never answers.
- [x] 3.3 Keep the capture window below the periodic refresh interval and assert the new total is greater than the total before the added bean. Verify: the assertions name both totals.

## 4. Documentation and suite hygiene

- [x] 4.1 Update `e2e/README.md` to describe the local provider and the live refresh case. Verify: the README mentions the provider and the case.
- [x] 4.2 Run `npm test`, `npm run test:e2e`, `npm run typecheck` and `nix flake check`. Verify: all pass.
