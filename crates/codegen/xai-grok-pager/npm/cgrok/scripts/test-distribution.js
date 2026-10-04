#!/usr/bin/env node
// Exercise the shipped npm installer and launcher in a temporary package/home.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const packageRoot = path.resolve(__dirname, '..');
const meta = require('../package.json');
const exe = process.platform === 'win32' ? '.exe' : '';

test('fork packages expose only cgrok and use one version', () => {
    assert.equal(meta.name, '@gucooing/cgrok');
    assert.deepEqual(meta.bin, { cgrok: 'bin/cgrok' });
    for (const [name, version] of Object.entries(meta.optionalDependencies)) {
        assert.ok(name.startsWith('@gucooing/cgrok-'));
        assert.equal(version, meta.version);
        const platform = require(path.join(packageRoot, '..', name.split('/')[1], 'package.json'));
        assert.equal(platform.name, name);
        assert.equal(platform.version, version);
    }
});

for (const explicitHome of [false, true]) test(`real installer ignores official settings (${explicitHome ? 'explicit' : 'default'} cgrok home)`, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cgrok-distribution-'));
    try {
        const pkg = path.join(root, 'package');
        const home = path.join(root, explicitHome ? 'cgrok-custom' : '.cgrok');
        const official = path.join(root, '.grok');
        fs.mkdirSync(pkg);
        fs.mkdirSync(home);
        fs.mkdirSync(official);
        const officialAuth = '{"official":"leave untouched"}\n';
        fs.writeFileSync(path.join(official, 'auth.json'), officialAuth);
        fs.writeFileSync(path.join(home, 'config.toml'), '[ui]\ntheme = "light"\n');
        fs.cpSync(path.join(packageRoot, 'bin'), path.join(pkg, 'bin'), { recursive: true });
        fs.writeFileSync(path.join(pkg, 'package.json'), JSON.stringify(meta));
        const platformName = `cgrok-${process.platform}-${process.arch}`;
        const vendor = path.join(pkg, 'node_modules', '@gucooing', platformName);
        fs.mkdirSync(path.join(vendor, 'bin'), { recursive: true });
        fs.writeFileSync(path.join(vendor, 'package.json'), JSON.stringify({ name: `@gucooing/${platformName}`, version: meta.version }));
        // A real executable proves the launcher resolves the installed binary and forwards its arguments.
        fs.copyFileSync(process.execPath, path.join(vendor, 'bin', `cgrok${exe}`));
        const env = {
            ...process.env,
            HOME: root,
            USERPROFILE: root,
            GROK_HOME: official,
            CGROK_NPM_REGISTRY: 'https://registry.npmjs.org',
            CGROK_INSTALL_COMPLETIONS: '0',
            GROK_INSTALL_COMPLETIONS: '1',
            GROK_NPM_REGISTRY: 'https://ignored.invalid',
            XAI_API_KEY: 'official-key-must-be-ignored',
            NODE_PATH: [path.join(packageRoot, 'node_modules'), process.env.NODE_PATH].filter(Boolean).join(path.delimiter),
            npm_config_user_agent: 'cgrok-test',
        };
        if (explicitHome) env.CGROK_HOME = home; else delete env.CGROK_HOME;
        const install = spawnSync(process.execPath, [path.join(pkg, 'bin', 'postinstall.js')], { env, encoding: 'utf8' });
        assert.equal(install.status, 0, install.stderr);
        assert.ok(fs.existsSync(path.join(home, 'bin', `cgrok${exe}`)));
        assert.equal(fs.readFileSync(path.join(official, 'auth.json'), 'utf8'), officialAuth);
        assert.deepEqual(fs.readdirSync(official), ['auth.json']);
        assert.ok(!fs.existsSync(path.join(home, 'auth.json')));
        const config = require('@iarna/toml').parse(fs.readFileSync(path.join(home, 'config.toml'), 'utf8'));
        assert.equal(config.ui.theme, 'light');
        assert.equal(config.cli.installer, 'npm');
        const launch = spawnSync(process.execPath, [path.join(pkg, 'bin', 'cgrok'), '--eval', 'process.stdout.write("cgrok-native-ok")'], { env, encoding: 'utf8' });
        assert.equal(launch.status, 0, launch.stderr);
        assert.equal(launch.stdout, 'cgrok-native-ok');
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
});
