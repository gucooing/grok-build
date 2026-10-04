# cgrok

This fork runs as `cgrok` and uses the same service domain as `ccodex`:

- OAuth: `https://oauth-ai.alsl.xyz/api/oauth/grok`
- API: `https://oauth-ai.alsl.xyz/api/oauth/grok/v1`

The executable is `cgrok` (`cgrok.exe` on Windows), the npm package is `@gucooing/cgrok`, and user/project configuration lives in `.cgrok`. `CGROK_HOME` changes the user directory; `GROK_HOME`, official API-key variables and `.grok` files are not configuration inputs for cgrok.

## Install

After a fork release has been published:

```sh
npm install -g @gucooing/cgrok@latest
cgrok login
cgrok
```

The existing native installers and `cgrok update` target this fork's binaries and package:

```sh
curl -fsSL https://raw.githubusercontent.com/gucooing/grok-build/main/crates/codegen/xai-grok-pager/scripts/install.sh | bash
```

```powershell
irm https://raw.githubusercontent.com/gucooing/grok-build/main/crates/codegen/xai-grok-pager/scripts/install.ps1 | iex
```

## Configuration

The original endpoint configuration mechanism remains in use. Its environment variables use the independent `CGROK_*` prefix. For a different API and OAuth service, set the existing options in `~/.cgrok/config.toml`:

```toml
[endpoints]
cli_chat_proxy_base_url = "http://127.0.0.1:3002/grok/v1"
xai_api_base_url = "http://127.0.0.1:3002/grok/v1"

[cgrok_com_config.oauth2]
issuer = "http://127.0.0.1:3002/grok"
```

Alternatively use `CGROK_CLI_CHAT_PROXY_BASE_URL` and the existing OAuth options `CGROK_OAUTH2_ISSUER` / `CGROK_OAUTH2_CLIENT_ID`. The client ID remains `b1a00492-073a-47ea-816f-4c329264a828`. API-key authentication uses `CGROK_API_KEY`. There is no environment alias bridge or fallback to official Grok variables.

Protocol headers, OAuth client ID and scopes, PKCE/state/nonce/JWT checks, and model IDs retain their Grok protocol values. Repository instructions use `CGROK.md` and `.cgrok` paths.

## Build

Use the toolchain in `rust-toolchain.toml` and provide [DotSlash](https://dotslash-cli.com) or `PROTOC`/`protoc` for protobuf generation. Linux also requires a native compiler, `pkg-config` and OpenSSL development headers.

```sh
cargo run -p xai-grok-pager-bin
cargo build -p xai-grok-pager-bin --release  # target/release/cgrok
cargo test -p xai-grok-env -p xai-dirs
```

Internal `xai-grok-*` crate names and the generated workspace structure remain unchanged. `SOURCE_REV` records the upstream source. The existing npm platform packages are under `crates/codegen/xai-grok-pager/npm/cgrok*`.

Release tags normally use `vX.Y.Z`. A `vX.Y.Z+N` tag retries a failed packaging run with new assets while the binary and npm package versions remain `X.Y.Z`.

First-party code is Apache-2.0; see [LICENSE](LICENSE). Preserve [THIRD-PARTY-NOTICES](THIRD-PARTY-NOTICES), [tool notices](crates/codegen/xai-grok-tools/THIRD_PARTY_NOTICES.md) and [third_party/NOTICE](third_party/NOTICE) when distributing binaries.
