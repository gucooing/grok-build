# cgrok

The cgrok fork of Grok Build defaults to `https://oauth-ai.alsl.xyz/api/oauth/grok` for OAuth and that address plus `/v1` for API requests.

```sh
npm install -g @gucooing/cgrok
cgrok login
cgrok
```

The command is `cgrok`; the default user and project directory is `.cgrok`. `CGROK_HOME` selects a different user directory. Official `GROK_*` variables, `XAI_API_KEY` and `.grok` files are ignored. Use the independent `CGROK_*` variables and existing endpoint settings in `~/.cgrok/config.toml`.

```sh
cgrok -p "Explain this codebase"
cgrok update
```

Packages cover macOS, Linux and Windows on x64 and arm64. Updates use `@gucooing/cgrok`. See the [repository](https://github.com/gucooing/grok-build) for native installation and source builds. Publishing packages/releases is separate from changing this source.
