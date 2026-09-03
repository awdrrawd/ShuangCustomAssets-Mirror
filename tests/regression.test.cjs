const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const path = require('node:path');
const fs = require('node:fs');
const { rollup } = require('rollup');
const alias = require('@rollup/plugin-alias');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

let code;
before(async () => {
    const modules = {
        gizmo: 'assets/freeTransform', settings: 'assets/settings', capacity: 'lib/accountCapacity', editor: 'assets/editPanel', validation: 'assets/textureValidation', renderer: 'assets/render', importer: 'assets/importExport',
        persistence: 'lib/persistence', list: 'assets/listView', slots: 'assets/textureListCanvas',
        shared: 'assets/state', constants: 'assets/constants', limits: 'lib/imageLimits',
        images: 'lib/gifPlayer', i18n: 'i18n/index', catalog: 'i18n/messages', animation: 'lib/gifAnimationLoop'
    };
    const bundle = await rollup({
        input: 'test-entry',
        plugins: [{ name: 'entry', resolveId: id => id === 'test-entry' ? id : null,
            transform: (source, id) => id.endsWith('editPanel.js') ? source.replaceAll('import.meta.url', JSON.stringify('http://localhost:8080/assets/app-test.js')) : null,
            load: id => id === 'test-entry' ? Object.entries(modules).map(([name, file]) =>
                `export * as ${name} from ${JSON.stringify(path.resolve('src', file + '.js'))};`).join('\n') : null },
        alias({ entries: [{ find: /^@lib\/(.*)/, replacement: path.resolve('src/lib/$1') }] }), resolve(), commonjs()]
    });
    code = (await bundle.generate({ format: 'cjs' })).output[0].code;
    await bundle.close();
});

function session(overrides = {}) {
    const calls = [];
    const player = { MemberNumber: 7, AssetFamily: 'Female3DCG', Appearance: [], Crafting: [], ExtensionSettings: {}, IsPlayer: () => true, UnregisterHook() {} };
    const context = vm.createContext({
        exports: {}, console: { log() {}, warn() {}, error() {} }, URL, AbortController, Uint8Array, DataView,
        TextEncoder, ReadableStream, setInterval: () => 0, setTimeout: () => 0, clearTimeout() {},
        Player: player, window: {}, CurrentScreen: 'ChatRoom', DialogFocusItem: null, TranslationLanguage: 'EN',
        CharacterLoadCanvas() {}, CharacterGetCurrent: () => player, CharacterRefresh: () => calls.push('refresh'),
        ChatRoomCharacterItemUpdate: () => calls.push('item'), ChatRoomCharacterUpdate: () => calls.push('room'),
        ServerPlayerAppearanceSync: () => calls.push('appearance'), ServerPlayerExtensionSettingsSync: key => calls.push(key),
        ServerAppearanceBundle: items => items.map(({ Asset, ...item }) => ({ ...item, Name: Asset.Name, Group: Asset.Group.Name })),
        AssetGet: (family, group, name) => ({ Name: name, Group: { Name: group } }),
        CraftingValidate: () => 1, CraftingSaveServer: () => calls.push('craft'),
        CraftingDecompressServerData: data => data || [], DialogCanUnlock: () => true,
        navigator: { clipboard: { readText: async () => '{}' } }, ...overrides
    });
    vm.runInContext(code, context);
    return { context, api: context.exports, player: context.Player, calls };
}

const texture = () => ({ TextureURL: 'https://example.com/image.png', ScaleX: 100, ScaleY: 100 });
test('settings registration uses its own key for immediate and delayed initialization', () => {
    for (const delayed of [false, true]) {
        const registrations = [], pending = [];
        const register = entry => registrations.push(entry);
        const { api, context } = session({
            PreferenceRegisterExtensionSetting: delayed ? undefined : register,
            setTimeout: callback => pending.push(callback)
        });
        api.settings.initSettings();
        if (delayed) {
            assert.equal(registrations.length, 0);
            assert.equal(pending.length, 1);
            context.PreferenceRegisterExtensionSetting = register;
            pending.shift()();
        }
        assert.equal(registrations.length, 1);
        assert.equal(registrations[0].Identifier, 'ShuangCustomAssets');
        assert.equal(typeof registrations[0].load, 'function');
    }
});

function item(textures = [texture()]) {
    return { Asset: { Name: '自定义贴图', Group: { Name: 'ItemTorso' } }, Property: { Textures: textures } };
}



test('slider image is scaled to the existing handle size and resolves against the application host', () => {
    const images = [];
    const { api } = session({ MainCanvas: { fillRect() {} }, DrawImageResize: (...args) => images.push(args) });
    api.editor.drawBarField(api.constants.BAR_FIELDS[0]);
    assert.equal(images[0][0], 'http://localhost:8080/SCA_slider.png');
    assert.deepEqual(images[0].slice(3), [35, 35]);
    const png = fs.readFileSync('assets/SCA_slider.png');
    assert.ok(png.readUInt32BE(16) > 0);
    assert.equal(png.readUInt32BE(20), png.readUInt32BE(16));
});



test('master switch and owner blocking stop texture rendering and preview requests', async () => {
    let fetched = 0;
    const { api, context, player } = session({ fetch: () => { fetched++; throw Error('unexpected request'); } });
    assert.equal(api.settings.getImageLoadingEnabled(), true);
    api.settings.getSettings().imagesEnabled = false;
    const target = item();
    api.renderer.renderTexture({}, () => {}, { C: player, CA: target, L: 'Layer2' });
    assert.equal(api.slots.textureStatus(texture(), player).state, 'disabled');
    assert.equal(api.settings.isUrlAllowed('https://cdn.discordapp.com/a.png'), false);
    api.limits.setTextureDownloadsEnabled(false);
    await assert.rejects(api.limits.fetchImageBuffer('https://example.com/a.png'), { name: 'AbortError' });
    assert.equal(fetched, 0);
    api.settings.getSettings().imagesEnabled = true;
    api.settings.togglePlayerBlocked(99);
    assert.equal(api.settings.isPlayerBlocked(99), true);
    assert.equal(api.slots.textureStatus(texture(), { MemberNumber: 99 }).state, 'blocked');
    api.settings.togglePlayerBlocked(99);
    assert.equal(api.settings.isPlayerBlocked(99), false);
    api.settings.togglePlayerBlocked(player.MemberNumber);
    assert.equal(api.settings.isPlayerBlocked(player.MemberNumber), false);
});

test('capacity estimates only the requested key in UTF-8 bytes', () => {
    const { api } = session();
    const packet = api.capacity.extensionPacket('Example', { text: '中文' });
    assert.deepEqual(JSON.parse(JSON.stringify(packet)), { 'ExtensionSettings.Example': { text: '中文' } });
    assert.equal(api.capacity.packetBytes(packet), Buffer.byteLength(JSON.stringify(packet), 'utf8'));
});

test('login sanitized incoming data cannot overwrite a complete backup', () => {
    const { api, player } = session();
    const saved = item();
    const craft = { Item: saved.Asset.Name, Name: 'kept', ItemProperty: saved.Property };
    seedBackup(api, player, { version: 1,
        appearance: [{ Name: saved.Asset.Name, Group: 'ItemTorso', Property: saved.Property }], crafts: { 0: craft } });
    let login;
    api.persistence.setupPersistence({ hookFunction: (name, priority, fn) => { if (name === 'LoginResponse') login = fn; } });
    login([{ MemberNumber: player.MemberNumber, Appearance: [{ Name: saved.Asset.Name, Group: 'ItemTorso', Property: {} }],
        Crafting: [{ Item: saved.Asset.Name, Name: 'kept', ItemProperty: {} }] }], () => {});
    api.persistence.persistenceAssetsReady();
    assert.equal(player.Appearance[0].Property.Textures.length, 1);
    assert.equal(player.Crafting[0].ItemProperty.Textures.length, 1);
});

test('Craft validation that strips textures retains backup and does not install stripped data', () => {
    const { api, player } = session({ CraftingValidate: craft => { craft.ItemProperty = {}; return 1; } });
    const saved = { Item: '自定义贴图', Name: 'kept', ItemProperty: item().Property };
    seedBackup(api, player, { version: 1, appearance: [], crafts: { 0: saved } });
    api.persistence.persistenceAssetsReady();
    assert.equal(player.Crafting[0], undefined);
    assert.equal(player.ExtensionSettings[api.persistence.CRAFT_KEY].crafts[0].ItemProperty.Textures.length, 1);
});

test('late asset readiness refreshes the Craft index before validation', () => {
    let rebuilt = false;
    const { api, player, context } = session({ CraftingAssets: {},
        CraftingAssetsPopulate: () => { rebuilt = true; return { '自定义贴图': ['registered'] }; },
        CraftingValidate: () => { assert.equal(rebuilt, true); return 2; }
    });
    seedBackup(api, player, { version: 1, appearance: [], crafts: { 0: { Item: '自定义贴图', Name: 'saved', ItemProperty: item().Property } } });
    api.persistence.persistenceAssetsReady();
    assert.equal(player.Crafting[0].Name, 'saved');
    assert.deepEqual(context.CraftingAssets['自定义贴图'], ['registered']);
});

test('oversized backup preserves the last valid snapshot', () => {
    const { api, player } = session();
    api.persistence.persistenceAssetsReady();
    const previous = JSON.stringify(player.ExtensionSettings[api.persistence.SETTINGS_KEY]);
    const large = item(); large.Property.Textures[0].Alias = 'x'.repeat(180000);
    player.Appearance = [large];
    api.persistence.backupAppearance();
    assert.equal(JSON.stringify(player.ExtensionSettings[api.persistence.SETTINGS_KEY]), previous);
});

test('other-player block shortcut remains usable for locked items and cannot block self', () => {
    const { api, context, player } = session({ MouseIn: () => true, DialogCanUnlock: () => false });
    context.CharacterGetCurrent = () => ({ MemberNumber: 99 });
    context.DialogFocusItem = item(); context.DialogFocusItem.Property.LockedBy = 'Padlock';
    assert.equal(api.list.handlePlayerBlockClick(), true);
    assert.equal(api.settings.isPlayerBlocked(99), true);
    assert.equal(api.list.handlePlayerBlockClick(), true);
    assert.equal(api.settings.isPlayerBlocked(99), false);
    context.CharacterGetCurrent = () => player;
    assert.equal(api.list.handlePlayerBlockClick(), false);
});

test('pose input is sanitized, legacy scale migrates, zero values remain valid', () => {
    const { api } = session();
    const value = api.validation.sanitizeTexture({ Scale: 0, Opacity: 0, PoseSettings: {
        'BaseUpper+Kneel': { enabled: true, TextureURL: 123, Rotation: 'Infinity', Scale: 25 }, broken: null
    } });
    const result = api.renderer.resolvePoseParams(value, ['BaseUpper', 'Kneel']);
    assert.equal(result.TextureURL, '');
    assert.equal(result.ScaleX, 25);
    assert.equal(result.Opacity, 0);
    assert.equal(value.ScaleX, 0);
    assert.equal(result.Rotation, 0);
});

test('append overflow is atomic, including hole-filling', async () => {
    for (const textures of [Array.from({ length: 17 }, texture), [...Array.from({ length: 17 }, texture), null]]) {
        const { context, api, calls } = session();
        const target = context.DialogFocusItem = item(textures);
        const original = JSON.stringify(target);
        context.navigator.clipboard.readText = async () => JSON.stringify({ type: 'ShuangCustomAssets', textures: [texture(), texture()] });
        await api.importer.importConfig(target, 'append');
        assert.equal(JSON.stringify(target), original);
        assert.equal(calls.length, 0);
    }
});

test('append maps priorities to holes and preserves occupied slots', async () => {
    const { context, api } = session();
    const target = context.DialogFocusItem = item([texture(), null, texture()]);
    context.navigator.clipboard.readText = async () => JSON.stringify({ type: 'ShuangCustomAssets', textures: [texture()], overridePriority: { Layer1: 12 } });
    await api.importer.importConfig(target, 'append');
    assert.equal(target.Property.Textures.length, 3);
    assert.equal(target.Property.OverridePriority.Layer2, 12);
});

test('clipboard completion cannot modify a dialog that has already closed', async () => {
    const { context, api } = session();
    const target = context.DialogFocusItem = item();
    const original = JSON.stringify(target);
    context.navigator.clipboard.readText = async () => { context.DialogFocusItem = null; return JSON.stringify({ type: 'ShuangCustomAssets', textures: [] }); };
    await api.importer.importConfig(target, 'overwrite');
    assert.equal(JSON.stringify(target), original);
});

test('cancel restores priority and removes a new unconfirmed slot', () => {
    const { context, api } = session();
    const target = context.DialogFocusItem = item();
    target.Property.OverridePriority = { Layer1: 80 };
    Object.assign(api.shared.state, { currentEditTexture: 0, originalEditTexture: texture(), originalOverridePriority: { Layer1: 10 } });
    api.list.returnToListFromSubview();
    assert.equal(target.Property.OverridePriority.Layer1, 10);
    Object.assign(api.shared.state, { currentEditTexture: 0, originalEditTexture: null, originalOverridePriority: undefined });
    api.list.returnToListFromSubview();
    assert.equal(target.Property.Textures.length, 0);
    assert.equal(target.Property.OverridePriority, undefined);
});

test('slot actions always begin with add/delete and delete leaves other indexes intact', () => {
    const { context, api } = session();
    assert.deepEqual(Array.from(api.slots.slotActions(null, false)), ['add']);
    assert.deepEqual(Array.from(api.slots.slotActions(texture(), true)), ['delete']);
    const target = context.DialogFocusItem = item([texture(), texture()]);
    target.Property.OverridePriority = { Layer1: 8, Layer2: 9 };
    api.shared.state.deleteMode = true;
    api.list.handleSlotAction(target, {}, 'delete', 0);
    assert.equal(target.Property.Textures[0], null);
    assert.equal(target.Property.Textures.length, 2);
    assert.equal(target.Property.OverridePriority.Layer1, undefined);
    assert.equal(target.Property.OverridePriority.Layer2, 9);
});

test('locked slots cannot be deleted from action callbacks', () => {
    const { context, api } = session({ DialogCanUnlock: () => false });
    const target = context.DialogFocusItem = item();
    target.Property.LockedBy = 'Padlock';
    api.shared.state.deleteMode = true;
    api.list.handleSlotAction(target, {}, 'delete', 0);
    assert.equal(target.Property.Textures.length, 1);
});

test('Canvas slot rectangles keep actions contiguous and hit testing follows pagination and delete mode', () => {
    let point = [0, 0];
    const { api, player } = session({ MouseIn: (x, y, w, h) => point[0] >= x && point[0] < x + w && point[1] >= y && point[1] < y + h });
    const target = item(Array.from({ length: 18 }, texture));
    api.shared.state.currentListPage = 1;
    let rows = api.slots.slotLayout(target);
    assert.equal(rows[0].index, 6);
    assert.deepEqual(Array.from(rows[0].actions, a => a.action), ['visible', 'edit', 'trust']);
    player.ExtensionSettings.ShuangCustomAssets.allowedDomains = ['example.com'];
    rows = api.slots.slotLayout(target);
    assert.deepEqual(Array.from(rows[0].actions, a => a.action), ['visible', 'edit', 'preview']);
    assert.equal(rows[0].actions[2].width, rows[0].actions[2].height);
    for (let i = 1; i < rows[0].actions.length; i++) {
        assert.equal(rows[0].actions[i].x, rows[0].actions[i - 1].x + rows[0].actions[i - 1].width + 10);
    }
    const calls = [];
    const click = rect => { point = [rect.x + 1, rect.y + 1]; api.slots.clickTextureSlots(target, (...args) => calls.push(args)); };
    click(rows[0].actions[2]);
    assert.equal(calls.length, 0);
    click(rows[0].actions[0]);
    assert.deepEqual(calls.pop(), ['visible', 6]);
    api.shared.state.deleteMode = true;
    rows = api.slots.slotLayout(target);
    assert.equal(rows[0].actions.length, 1);
    assert.equal(rows[0].actions[0].x, 1620);
    click(rows[0].actions[0]);
    assert.deepEqual(calls.pop(), ['delete', 6]);
    target.Property.Textures[6] = null;
    api.shared.state.deleteMode = false;
    click(api.slots.slotLayout(target)[0].actions[0]);
    assert.deepEqual(calls.pop(), ['add', 6]);
});

test('Canvas preview uses a warning on failure, hovers only on its icon, and trust confirmation has no tooltip', () => {
    const buttons = [], labels = [], icons = [], draws = [];
    let failure = false, hovered = false;
    class FakeImage {
        width = 100; height = 80; handlers = {};
        addEventListener(name, callback) { this.handlers[name] = callback; }
        set src(value) { this.handlers[failure ? 'error' : 'load'](); }
    }
    const { api, context, player } = session({ Image: FakeImage,
        DrawButton: (...args) => buttons.push(args), DrawText: (...args) => labels.push(args), DrawTextFit() {},
        DrawImageResize: (...args) => icons.push(args), DrawHoverElements: [],
        MouseIn: () => hovered,
        MainCanvas: { measureText: text => ({ width: text.length * 15 }), save() {}, restore() {}, fillRect() {}, strokeRect() {}, drawImage: (...args) => draws.push(args) }
    });
    player.ExtensionSettings.ShuangCustomAssets = { urlLoadMode: 'whitelist', allowedDomains: ['example.com'], animatedImageEnabled: false };
    const target = item([{ ...texture(), TextureURL: 'https://example.com/ready.png' }]);
    api.slots.drawTextureSlots(target);
    assert.equal(icons[0][0], 'Icons/Explore.png');
    assert.equal(context.DrawHoverElements.length, 0);
    assert.equal(labels[0][0], 'Slot \u20071:');
    hovered = true;
    api.slots.drawTextureSlots(target);
    context.DrawHoverElements.pop()();
    assert.equal(draws.length, 1);
    assert.deepEqual(draws[0].slice(1), [1250, 25, 500, 400]);
    const longURL = 'https://example.com/' + 'x'.repeat(100);
    const shortened = api.slots.shortSlotLabel(longURL);
    assert.ok(shortened.startsWith('https://example.com/'));
    assert.ok(shortened.endsWith('...'));
    assert.ok(shortened.length * 15 <= 376);
    assert.equal(api.slots.shortSlotLabel('short'), 'short');
    failure = true;
    target.Property.Textures[0].TextureURL = 'https://example.com/broken.png';
    api.slots.drawTextureSlots(target);
    assert.equal(icons.at(-1)[0], 'Icons/Small/Warning.png');
    assert.equal(context.DrawHoverElements.length, 0);
    assert.ok(buttons.some(args => String(args[7]).includes('Image unavailable')));
    api.shared.state.currentListPage = 1;
    api.slots.drawTextureSlots(item(Array(18).fill(null)));
    assert.ok(labels.some(args => args[0] === 'Slot 10:'));
    buttons.length = 0;
    api.list.drawAddDomainConfirm();
    assert.equal(buttons.length, 2);
    assert.ok(buttons.every(args => args[7] == null));
});

test('late startup restores appearance and Craft from ExtensionSettings', () => {
    const { api, player, calls } = session();
    const saved = item();
    seedBackup(api, player, { version: 1,
        appearance: [{ Name: saved.Asset.Name, Group: 'ItemTorso', Property: saved.Property }],
        crafts: { 4: { Item: saved.Asset.Name, Name: 'saved', ItemProperty: saved.Property } } });
    api.persistence.persistenceAssetsReady();
    assert.equal(player.Appearance[0].Property.Textures[0].TextureURL, texture().TextureURL);
    assert.equal(player.Crafting[4].Name, 'saved');
    assert.ok(calls.includes('craft'));
    // Normal removal must update the backup instead of resurrecting data on the next login.
    player.Appearance = [];
    player.Crafting[4] = null;
    api.persistence.backupAppearance(); api.persistence.backupCrafts();
    assert.equal(player.ExtensionSettings[api.persistence.SETTINGS_KEY].appearanceBackup.appearance.length, 0);
    assert.equal(Object.keys(player.ExtensionSettings[api.persistence.CRAFT_KEY].crafts).length, 0);
});

test('login captures raw Craft before game validation clears it', () => {
    const { api, player } = session();
    const hooks = {};
    api.persistence.setupPersistence({ hookFunction: (name, priority, fn) => hooks[name] = fn });
    api.persistence.persistenceAssetsReady();
    const raw = { MemberNumber: 7, Appearance: [], Crafting: [{ Item: '自定义贴图', Name: 'raw', ItemProperty: { Textures: [texture()] } }] };
    hooks.LoginResponse([raw], () => { player.Crafting = []; hooks.CraftingSaveServer([], () => {}); });
    assert.equal(player.Crafting[0].Name, 'raw');
});

test('restore retains conflicts and never overwrites another asset or Craft', () => {
    const { api, player } = session();
    player.Appearance = [{ Asset: { Name: 'Other', Group: { Name: 'ItemTorso' } } }];
    player.Crafting = [{ Item: 'Other', Name: 'keep' }];
    seedBackup(api, player, { version: 1,
        appearance: [{ Name: '自定义贴图', Group: 'ItemTorso', Property: { Textures: [texture()] } }],
        crafts: { 0: { Item: '自定义贴图', Name: 'saved' } } });
    api.persistence.persistenceAssetsReady();
    assert.equal(player.Appearance[0].Asset.Name, 'Other');
    assert.equal(player.Crafting[0].Name, 'keep');
    assert.equal(player.ExtensionSettings[api.persistence.SETTINGS_KEY].appearanceBackup.appearance.length, 1);
    assert.ok(player.ExtensionSettings[api.persistence.CRAFT_KEY].crafts[0]);
});

test('animation disabled skips fetch/decode and untrusted hover skips loading', () => {
    let fetched = 0;
    const { api } = session({ fetch: () => { fetched++; throw Error('unexpected'); } });
    assert.equal(api.images.getAnimatedImage('https://example.com/a.gif', null, false).loaded, true);
    assert.equal(api.slots.textureStatus(texture(), {}).state, 'blocked');
    assert.equal(fetched, 0);
});

test('decode limits reject huge canvases and excessive frames before allocation', () => {
    const { api } = session();
    assert.throws(() => api.limits.checkImageBudget(100000, 100000, 2));
    assert.throws(() => api.limits.checkImageBudget(10, 10, 301));
    assert.doesNotThrow(() => api.limits.checkImageBudget(512, 512, 30));
});

test('download size limit rejects even without a Content-Length header', async () => {
    const { api } = session({ fetch: async () => ({ ok: true, headers: { get: () => null },
        body: new ReadableStream({ start(c) { c.enqueue(new Uint8Array(21 * 1024 * 1024)); c.close(); } }) }) });
    await assert.rejects(api.limits.fetchImageBuffer('https://example.com/huge'), /too large/);
});

test('download timeout aborts stalled body reads', async () => {
    let timeout;
    const { api } = session({ setTimeout: fn => { timeout = fn; return 1; },
        fetch: async (url, { signal }) => ({ ok: true, headers: { get: () => null },
            body: new ReadableStream({ start(c) { signal.addEventListener('abort', () => c.error(new Error('aborted'))); } }) }) });
    const pending = api.limits.fetchImageBuffer('https://example.com/stall');
    timeout();
    await assert.rejects(pending, /aborted/);
});

test('both locales contain the same keys and interpolation does not alter user text', () => {
    const { api, context } = session();
    assert.deepEqual(Object.keys(api.catalog.messages.CN), Object.keys(api.catalog.messages.EN));
    context.TranslationLanguage = 'TW';
    assert.match(api.i18n.t('importExport.copied_to_clipboard_layers', [3]), /3/);
    context.TranslationLanguage = 'EN';
    assert.match(api.i18n.t('importExport.copied_to_clipboard_layers', [3]), /Copied/);
});

test('all literal translation references exist in the catalog', () => {
    const { api } = session();
    for (const file of fs.readdirSync('src', { recursive: true }).filter(file => file.endsWith('.js'))) {
        const source = fs.readFileSync(path.join('src', file), 'utf8');
        for (const match of source.matchAll(/\bt\("([^"]+)"|messages\.(?:CN|EN)\["([^"]+)"\]/g)) {
            assert.ok(Object.hasOwn(api.catalog.messages.EN, match[1] || match[2]), `${file}: ${match[1] || match[2]}`);
        }
    }
});

test('appearance and Craft properties cleared by login validation recover from backup', () => {
    const { api, player } = session();
    player.Appearance = [item([])];
    player.Crafting = [{ Item: '自定义贴图', Name: 'saved', ItemProperty: {} }];
    seedBackup(api, player, { version: 1,
        appearance: [{ Name: '自定义贴图', Group: 'ItemTorso', Property: { Textures: [texture()] } }],
        crafts: { 0: { Item: '自定义贴图', Name: 'saved', ItemProperty: { Textures: [texture()] } } } });
    api.persistence.persistenceAssetsReady();
    assert.equal(player.Appearance[0].Property.Textures.length, 1);
    assert.equal(player.Crafting[0].ItemProperty.Textures.length, 1);
});

test('item sync forgets stale animation tracking before the game redraws', () => {
    const { api, player, context } = session();
    const hooks = {};
    context.ChatRoomCharacter = [player];
    context.CharacterAppearanceBuildCanvas = () => { api.animation.notifyGifFrame(player, 0, 0, Date.now() + 100); };
    api.animation.setupGifAnimationHooks({ hookFunction: (name, priority, callback) => { hooks[name] = callback; } });
    api.animation.notifyGifFrame(player, 0, 0, Date.now() + 100);
    const result = hooks.ChatRoomSyncItem([{ Item: { Target: player.MemberNumber } }], () => {
        api.animation.notifyGifFrame(player, 0, 0, Date.now() + 100);
        return 'synced';
    });
    assert.equal(result, 'synced');
    let refreshes = 0;
    context.CharacterAppearanceBuildCanvas = () => { refreshes++; };
    api.animation.kickAllKnownAnimated();
    assert.equal(refreshes, 1);
});

test('bootstrap waits for game globals and concurrent loaders initialize only once', async () => {
    const source = fs.readFileSync('src/main.js', 'utf8').replace('import("./app.js")', 'loadApp()');
    let wake, imported = 0, started = 0;
    const context = vm.createContext({ console, setTimeout: callback => { wake = callback; },
        loadApp: async () => { imported++; return { start: async () => { started++; } }; } });
    const run = () => vm.runInContext(`(async () => { ${source} })()`, context);
    const first = run(), second = run();
    await Promise.resolve();
    assert.equal(imported, 0);
    Object.assign(context, { LoginResponse() {}, AssetGroup: [], TextAllScreenCache: new Map(), CraftingLoadServer() {}, AssetGet() {}, GLDraw2DCanvas() {} });
    wake();
    await Promise.all([first, second]);
    assert.equal(imported, 1);
    assert.equal(started, 1);
});

test('bootstrap skips SDK dependencies when a legacy loader already registered, including during the wait', async () => {
    const source = fs.readFileSync('src/main.js', 'utf8').replace('import("./app.js")', 'loadApp()');
    for (const initiallyRegistered of [true, false]) {
        let registered = initiallyRegistered, imported = 0, wake;
        const context = vm.createContext({ console, setTimeout: callback => { wake = callback; },
            bcModSdk: { getModsInfo: () => registered ? [{ name: 'ShuangCustomAssets' }] : [] },
            loadApp: async () => { imported++; return { start() {} }; }
        });
        const pending = vm.runInContext(`(async () => { ${source} })()`, context);
        await Promise.resolve();
        if (!initiallyRegistered) {
            registered = true;
            Object.assign(context, { LoginResponse() {}, AssetGroup: [], TextAllScreenCache: new Map(), CraftingLoadServer() {}, AssetGet() {}, GLDraw2DCanvas() {} });
            wake();
        }
        await pending;
        assert.equal(imported, 0);
    }
});

test('bootstrap retries a download failure but never retries a partially registered mod', async () => {
    const source = fs.readFileSync('src/main.js', 'utf8').replace('import("./app.js")', 'loadApp()');
    for (const registerBeforeFailure of [false, true]) {
        let imported = 0, registered = false;
        const context = vm.createContext({ console: { error() {} },
            LoginResponse() {}, AssetGroup: [], TextAllScreenCache: new Map(), CraftingLoadServer() {}, AssetGet() {}, GLDraw2DCanvas() {},
            bcModSdk: { getModsInfo: () => registered ? [{ name: 'ShuangCustomAssets' }] : [] },
            loadApp: async () => {
                imported++;
                if (!registerBeforeFailure) throw Error('download failed');
                return { start() { registered = true; throw Error('setup failed'); } };
            }
        });
        const run = () => vm.runInContext(`(async () => { ${source} })()`, context);
        await assert.rejects(run());
        await assert.rejects(run());
        assert.equal(imported, registerBeforeFailure ? 1 : 2);
    }
});

test('failed backup sync preserves the old snapshot and allows retry', () => {
    const { api, player, context } = session();
    api.persistence.persistenceAssetsReady();
    const previous = JSON.stringify(player.ExtensionSettings[api.persistence.SETTINGS_KEY]);
    player.Appearance = [item()];
    context.ServerPlayerExtensionSettingsSync = () => { throw Error('offline'); };
    api.persistence.backupAppearance();
    assert.equal(JSON.stringify(player.ExtensionSettings[api.persistence.SETTINGS_KEY]), previous);
    context.ServerPlayerExtensionSettingsSync = () => {};
    api.persistence.backupAppearance();
    assert.equal(player.ExtensionSettings[api.persistence.SETTINGS_KEY].appearanceBackup.appearance.length, 1);
});

test('PNG frame control cannot allocate a frame larger than the declared canvas', () => {
    const { api } = session();
    const buffer = new ArrayBuffer(71);
    const view = new DataView(buffer);
    view.setUint32(8, 13); view.setUint32(12, 0x49484452);
    view.setUint32(16, 10); view.setUint32(20, 10);
    view.setUint32(33, 26); view.setUint32(37, 0x6663544c);
    view.setUint32(45, 100000); view.setUint32(49, 100000);
    assert.throws(() => api.limits.inspectPng(buffer), /limits/);
});


test('plugin switch rejects remote texture application but display switch preserves permissions', () => {
    const { api, player } = session();
    const hooks = {};
    api.settings.setupSettingsHooks({ hookFunction: (name, priority, hook) => { hooks[name] = hook; } });
    const check = (before, after, params) => hooks.ValidationResolveAppearanceDiff(['ItemTorso', before, after, params], () => 'normal-validation');
    const remote = { C: player, fromSelf: false };
    const target = item();
    assert.equal(api.settings.getPluginEnabled(), true);
    api.settings.getSettings().imagesEnabled = false;
    assert.equal(check(null, target, remote), 'normal-validation');
    api.settings.getSettings().pluginEnabled = false;
    api.settings.getSettings().imagesEnabled = true;
    assert.equal(api.settings.getImageLoadingEnabled(), false);
    assert.equal(check(null, target, remote).valid, false);
    const changed = { ...target, Property: { Textures: [] } };
    target.Asset.circular = target.Asset;
    assert.equal(check(target, changed, remote).item, target);
    assert.equal(check(target, target, remote), 'normal-validation');
    assert.equal(check(target, null, remote), 'normal-validation');
    assert.equal(check(null, target, { C: player, fromSelf: true }), 'normal-validation');
    assert.equal(check(null, target, { C: { MemberNumber: 99 }, fromSelf: false }), 'normal-validation');
    assert.equal(check(null, { Asset: { Name: 'Other' } }, remote), 'normal-validation');
    api.settings.getSettings().pluginEnabled = true;
    assert.equal(check(null, target, remote), 'normal-validation');
});

test('portable backup import validates atomically and restores missing data without replacing conflicts', () => {
    const { api, player } = session();
    api.persistence.persistenceAssetsReady();
    const saved = { type: 'ShuangCustomAssetsBackupFile', version: 1, appearance: [
        { Name: api.constants.ASSET_NAME, Group: 'ItemTorso', Property: { Textures: [texture()] } }
    ], crafts: {} };
    const old = JSON.stringify(player.ExtensionSettings);
    assert.throws(() => api.persistence.importPlayerBackup({ ...saved, crafts: { bad: {} } }));
    assert.equal(JSON.stringify(player.ExtensionSettings), old);
    assert.equal(player.Appearance.length, 0);
    api.persistence.importPlayerBackup(saved);
    assert.equal(player.Appearance[0].Property.Textures[0].TextureURL, texture().TextureURL);
    const exported = api.persistence.exportPlayerBackup();
    exported.appearance[0].Property.Textures[0].TextureURL = 'https://example.com/other.png';
    api.persistence.importPlayerBackup(exported);
    assert.equal(player.Appearance[0].Property.Textures[0].TextureURL, texture().TextureURL);
    const huge = { ...saved, appearance: [{ ...saved.appearance[0], extra: 'x'.repeat(180000) }] };
    const previous = JSON.stringify(player.ExtensionSettings);
    assert.throws(() => api.persistence.importPlayerBackup(huge), /budget/);
    assert.equal(JSON.stringify(player.ExtensionSettings), previous);
});




test('direct preview movement needs no image geometry or canvas hooks and preserves cancel', () => {
    const { api, context } = session({ MouseX: 550, MouseY: 150 });
    const target = { ...texture(), OffsetX: 12, OffsetY: 23 };
    const original = { ...target };
    const focused = context.DialogFocusItem = item([target]);
    Object.assign(api.shared.state, { currentEditTexture: 0, tempTextureData: target, originalEditTexture: original, isDragMode: true, _pointerDown: true });
    api.editor.updateDragMove();
    assert.equal(api.shared.state.dragActive, true);
    context.MouseX = 590; context.MouseY = 180;
    api.editor.updateDragMove();
    assert.equal(target.OffsetX, 52); assert.equal(target.OffsetY, 53);
    assert.equal(api.shared.state._fieldsDirty, true);
    api.shared.state._pointerDown = false;
    api.editor.updateDragMove();
    assert.equal(api.shared.state.dragActive, false);
    api.list.returnToListFromSubview();
    assert.equal(focused.Property.Textures[0].OffsetX, 12);
    assert.equal(focused.Property.Textures[0].OffsetY, 23);
});

test('direct movement respects locks, preview boundaries and pose editing', () => {
    const { api, context } = session({ MouseX: 1200, MouseY: 200 });
    const target = { ...texture(), PoseSettings: { Kneel: { OffsetX: 0, OffsetY: 0 } } };
    const focused = context.DialogFocusItem = item([target]);
    Object.assign(api.shared.state, { currentEditTexture: 0, tempTextureData: target, poseEditing: 'Kneel', isDragMode: true, _pointerDown: true });
    api.editor.updateDragMove(); assert.equal(api.shared.state.dragActive, false);
    context.MouseX = 600;
    api.editor.updateDragMove();
    context.MouseX = 620; api.editor.updateDragMove();
    assert.equal(target.PoseSettings.Kneel.OffsetX, 20);
    assert.equal(target.OffsetX, undefined);
    focused.Property.LockedBy = 'Padlock'; context.DialogCanUnlock = () => false;
    context.MouseX = 640; api.editor.updateDragMove();
    assert.equal(target.PoseSettings.Kneel.OffsetX, 20);
    assert.equal(api.shared.state.dragActive, false);
    focused.Property.LockedBy = null;
    api.shared.state.poseSwitchMode = 'select';
    api.editor.updateDragMove(); assert.equal(api.shared.state.dragActive, false);
});


test('restored scale drag works alongside movement updates, supports both axes, clamps and cancels', () => {
    const { api, context } = session({ MouseX: 600, MouseY: 200 });
    const target = { ...texture(), ScaleX: 100, ScaleY: 150, ScaleLocked: false };
    const focused = context.DialogFocusItem = item([target]);
    Object.assign(api.shared.state, { currentEditTexture: 0, tempTextureData: target, originalEditTexture: { ...target }, isScaleDragMode: true, _pointerDown: true });
    const frame = () => { api.editor.updateDragMove(); api.editor.updateScaleDrag(); };
    frame(); context.MouseX = 640; context.MouseY = 260; frame();
    assert.equal(target.ScaleX, 120); assert.equal(target.ScaleY, 180);
    assert.equal(target.OffsetX, undefined);
    api.shared.state._pointerDown = false; frame();
    assert.equal(api.shared.state.scaleDrag, null);
    target.ScaleLocked = true;
    api.shared.state._pointerDown = true; frame();
    context.MouseX = 660; frame();
    assert.equal(target.ScaleX, 130); assert.equal(target.ScaleY, 130);
    focused.Property.LockedBy = 'Padlock'; context.DialogCanUnlock = () => false;
    context.MouseX = 680; frame();
    assert.equal(target.ScaleX, 130); assert.equal(api.shared.state.scaleDrag, null);
    focused.Property.LockedBy = null; target.ScaleX = 1999; target.ScaleY = 1999;
    frame(); context.MouseX = 800; frame(); assert.equal(target.ScaleX, 2000);
    api.list.returnToListFromSubview();
    assert.equal(focused.Property.Textures[0].ScaleX, 100);
    assert.equal(focused.Property.Textures[0].ScaleY, 150);
    assert.equal(api.shared.state.isScaleDragMode, false);
});

test('original Move and Drag buttons are restored with mutually exclusive modes', () => {
    let hovered = 'scale';
    const buttons = [];
    const { api } = session({ MouseIn: (x, y) => hovered === 'scale' ? y === 660 && x === 1435 : y === 510 && x === 1435,
        DrawButton: (...args) => buttons.push(args), DrawText() {} });
    assert.equal(api.editor.handleScaleDragButtonClick(), true);
    assert.equal(api.shared.state.isScaleDragMode, true);
    hovered = 'move'; api.editor.handleMoveButtonClick();
    assert.equal(api.shared.state.isDragMode, true);
    assert.equal(api.shared.state.isScaleDragMode, false);
    hovered = 'scale'; api.editor.handleScaleDragButtonClick();
    assert.equal(api.shared.state.isDragMode, false);
    api.editor.drawMoveButton(); api.editor.drawScaleDragButton();
    assert.deepEqual(buttons.map(b => b.slice(0, 5)), [[1435, 510, 100, 40, 'Move'], [1435, 660, 100, 40, 'Drag']]);
    assert.equal(api.constants.ASPECT_LOCK_BTN_X, 1555);
});


test('shared drag listeners register once and finish mouse, touch and blur consistently', () => {
    const handlers = {}, registrations = [];
    const listen = (name, fn) => { handlers[name] = fn; registrations.push(name); };
    const { api, context } = session({ MouseX: 600, MouseY: 200, MouseIn: () => false,
        document: { addEventListener: listen }, window: { addEventListener: listen } });
    const target = { ...texture(), OffsetX: 0, OffsetY: 0 };
    context.DialogFocusItem = item([target]);
    Object.assign(api.shared.state, { currentEditTexture: 0, tempTextureData: target, isDragMode: true });
    api.editor.setupStepperListeners(); api.editor.setupStepperListeners();
    assert.equal(registrations.length, 6);
    handlers.mousedown({ type: 'mousedown' }); context.MouseX = 620;
    handlers.mouseup({ type: 'mouseup' }); assert.equal(target.OffsetX, 20);
    assert.equal(api.shared.state._pointerDown, false);
    api.shared.state.isDragMode = false; api.shared.state.isScaleDragMode = true;
    handlers.touchstart({ type: 'touchstart' }); context.MouseX = 660;
    handlers.touchend({ type: 'touchend' }); assert.equal(target.ScaleX, 120);
    assert.equal(api.shared.state.scaleDrag, null);
    handlers.touchstart({ type: 'touchstart' }); context.MouseX = 700;
    handlers.blur({ type: 'blur' }); assert.equal(target.ScaleX, 120);
    assert.equal(api.shared.state._pointerDown, false); assert.equal(api.shared.state.scaleDrag, null);
});


test('settings drag scroll skips controls, uses a movement threshold and releases capture', () => {
    const handlers = {};
    let captured = false, prevented = 0;
    const root = { addEventListener: (name, fn) => { handlers[name] = fn; }, setPointerCapture: () => { captured = true; },
        hasPointerCapture: () => captured, releasePointerCapture: () => { captured = false; } };
    const scroller = { parentElement: root, scrollHeight: 900, clientHeight: 300, scrollTop: 100, closest: () => null };
    const { api } = session({ getComputedStyle: () => ({ overflowY: 'auto' }) });
    api.settings.enableSettingsDragScroll(root);
    const event = { target: scroller, pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1, clientY: 200, preventDefault: () => { prevented++; } };
    handlers.pointerdown(event);
    handlers.pointermove({ ...event, clientY: 202 }); assert.equal(scroller.scrollTop, 100);
    handlers.pointermove({ ...event, clientY: 150 }); assert.equal(scroller.scrollTop, 150); assert.equal(captured, true);
    handlers.pointerup(event); assert.equal(captured, false);
    let stopped = false;
    handlers.click({ preventDefault() {}, stopPropagation: () => { stopped = true; } }); assert.equal(stopped, true);
    handlers.pointerdown({ ...event, target: { closest: () => ({}) } });
    handlers.pointermove({ ...event, clientY: 100 }); assert.equal(scroller.scrollTop, 150);
    handlers.pointerdown({ ...event, pointerType: 'touch' });
    handlers.pointermove({ ...event, clientY: 100 }); assert.equal(scroller.scrollTop, 150);
    assert.equal(prevented, 1);
});

function seedBackup(api, player, backup) {
    api.settings.getSettings().appearanceBackup = { version: 1, appearance: backup.appearance };
    player.ExtensionSettings[api.persistence.CRAFT_KEY] = { version: 1, crafts: backup.crafts };
}

test('appearance and Craft save independently with separate packet budgets', () => {
    const sent = [];
    const { api, player } = session({ ServerPlayerExtensionSettingsSync: key => sent.push(key) });
    api.persistence.persistenceAssetsReady();
    sent.length = 0;
    const large = item(); large.Property.Padding = 'a'.repeat(100000);
    player.Appearance = [large];
    api.persistence.backupAppearance();
    assert.deepEqual(sent, [api.persistence.SETTINGS_KEY]);
    assert.equal(Object.keys(player.ExtensionSettings[api.persistence.CRAFT_KEY].crafts).length, 0);
    sent.length = 0;
    player.Crafting = [{ Item: large.Asset.Name, Name: 'saved', Description: 'c'.repeat(100000), ItemProperty: item().Property }];
    api.persistence.backupCrafts();
    assert.deepEqual(sent, [api.persistence.CRAFT_KEY]);
    const exported = api.persistence.exportPlayerBackup();
    assert.ok(Buffer.byteLength(JSON.stringify(exported)) > 180000);
    const other = session(); other.api.persistence.persistenceAssetsReady();
    other.api.persistence.importPlayerBackup(exported);
    assert.equal(other.player.Appearance[0].Property.Padding.length, 100000);
    assert.equal(other.player.Crafting[0].Description.length, 100000);
    const before = JSON.stringify(other.player.ExtensionSettings);
    exported.crafts[0].Description = 'x'.repeat(180000);
    exported.appearance[0].Property.Padding = 'changed';
    assert.throws(() => other.api.persistence.importPlayerBackup(exported), /180 kB/);
    assert.equal(JSON.stringify(other.player.ExtensionSettings), before);
});

test('Craft overflow and failed sync preserve its prior backup without changing appearance', () => {
    const { api, player, context } = session();
    api.persistence.persistenceAssetsReady();
    const before = JSON.stringify(player.ExtensionSettings);
    player.Crafting = [{ Item: item().Asset.Name, Name: 'saved', Description: 'x'.repeat(180000) }];
    api.persistence.backupCrafts();
    assert.equal(JSON.stringify(player.ExtensionSettings), before);
    player.Crafting[0].Description = 'small';
    context.ServerPlayerExtensionSettingsSync = () => { throw Error('offline'); };
    api.persistence.backupCrafts();
    assert.equal(JSON.stringify(player.ExtensionSettings), before);
    context.ServerPlayerExtensionSettingsSync = () => {};
    api.persistence.backupCrafts();
    assert.equal(player.ExtensionSettings[api.persistence.CRAFT_KEY].crafts[0].Description, 'small');
});

test('existing preference names and whitelist values remain intact', () => {
    const { api, player } = session();
    const original = { urlLoadMode: 'whitelist', allowedDomains: ['example.com'], domainWarningEnabled: false,
        animatedImageEnabled: false, gifFrameRate: 200, gifFpsSyncGame: false, blockedPlayers: [99] };
    player.ExtensionSettings.ShuangCustomAssets = original;
    assert.equal(api.settings.getSettings(), original);
    assert.equal(api.settings.getDomainWarningEnabled(), false);
    assert.equal(api.settings.getAnimatedImageEnabled(), false);
    assert.equal(api.settings.getGifFrameRate(), 200);
    assert.equal(api.settings.isDomainInWhitelist('https://example.com/a.png'), true);
    assert.equal(api.settings.isPlayerBlocked(99), true);
});

test('backups include only SCA items and do not modify settings or unrelated items', () => {
    const { api, player } = session();
    const ordinary = { Asset: { Name: 'Other', Group: { Name: 'Cloth' } }, Property: {} };
    const ordinaryCraft = { Item: 'Other', Name: 'keep' };
    const settings = { allowedDomains: ['example.com'] };
    player.ExtensionSettings.ShuangCustomAssets = settings;
    player.Appearance = [ordinary, item()];
    player.Crafting = [ordinaryCraft, { Item: item().Asset.Name, Name: 'SCA' }];
    api.persistence.persistenceAssetsReady();
    const backup = api.persistence.exportPlayerBackup();
    assert.equal(backup.appearance.length, 1);
    assert.deepEqual(Object.keys(backup.crafts), ['1']);
    assert.equal(player.Appearance[0], ordinary);
    assert.equal(player.Crafting[0], ordinaryCraft);
    assert.deepEqual(player.ExtensionSettings.ShuangCustomAssets.allowedDomains, settings.allowedDomains);
    assert.deepEqual(Object.keys(player.ExtensionSettings).sort(), ['ShuangCustomAssets', 'ShuangCustomAssetsCraft']);
});

test('transform mapping includes final crop, height scaling, mirroring and canvas matrix', () => {
    const { api } = session();
    for (const mirror of [false,true]) {
        const m = api.gizmo.imageMatrix({width:500,height:1200},500,20,
            {SourcePos:[0,100,500,1000],Width:400,Height:800,Mirror:mirror,Invert:mirror},
            {a:1.5,b:0,c:0,d:1.5,e:15,f:30});
        const point = api.gizmo.mapPoint(m,100,300);
        assert.ok(Math.abs(point.x-((mirror ? 820 : 580)*1.5+15)) < 1e-8);
        assert.ok(Math.abs(point.y-((mirror ? 660 : 180)*1.5+30)) < 1e-8);
        const restored = api.gizmo.unmapPoint(m,point.x,point.y);
        assert.ok(Math.abs(restored.x-100)<1e-8 && Math.abs(restored.y-300)<1e-8);
    }
});

test('transform resize keeps the rendered center, supports rectangles and rotated local axes', () => {
    const { api } = session();
    const g = {anchorX:100,anchorY:200,centerX:160,centerY:320,width:100,height:200,sourceWidth:100,sourceHeight:200,rotation:90};
    const initial = {OffsetX:10,OffsetY:20,ScaleX:100,ScaleY:100,Rotation:90,ScaleLocked:false};
    const result = api.gizmo.transformValues(g,initial,{x:0,y:0},{x:0,y:25},'3');
    assert.equal(result.ScaleX,150); assert.equal(result.ScaleY,100);
    assert.equal(g.anchorX+result.OffsetX+Math.round(g.sourceWidth*result.ScaleX/100)/2,g.centerX);
    assert.equal(g.anchorY+result.OffsetY+Math.round(g.sourceHeight*result.ScaleY/100)/2,g.centerY);
    const locked = api.gizmo.transformValues(g,{...initial,ScaleLocked:true},{x:0,y:0},{x:0,y:25},'3');
    assert.equal(locked.ScaleX,150); assert.equal(locked.ScaleY,150);
    const rotate = api.gizmo.transformValues(g,initial,{x:260,y:320},{x:160,y:420},'rotate');
    assert.equal(rotate.Rotation,-180);
});

test('geometry capture is isolated by player, item and selected layer and clears skipped draws', () => {
    const {api,player,context} = session();
    const selected = item(); context.DialogFocusItem = selected;
    Object.assign(api.shared.state,{freeTransform:true,currentEditTexture:0});
    const geometry = {centerX:250,centerY:400};
    api.gizmo.captureTextureGeometry(player,selected,0,geometry);
    assert.equal(api.shared.state.transformGeometry.centerX,250);
    api.gizmo.captureTextureGeometry({...player},selected,0,{centerX:900});
    api.gizmo.captureTextureGeometry(player,item(),0,{centerX:900});
    api.gizmo.captureTextureGeometry(player,selected,1,{centerX:900});
    assert.equal(api.shared.state.transformGeometry.centerX,250);
    api.gizmo.clearTextureGeometry(player,selected,0);
    assert.equal(api.shared.state.transformGeometry,null);
});

test('final draw capture ignores other characters and keeps return values; reset clears geometry', () => {
    const {api,player,context} = session();
    const hooks = {};
    context.DialogFocusItem = item();
    context.MainCanvas = {getTransform:()=>({a:1,b:0,c:0,d:1,e:0,f:0})};
    player.Canvas = {width:500,height:1200};
    Object.assign(api.shared.state,{freeTransform:true,currentEditTexture:0});
    api.gizmo.setupTransformCapture({hookFunction:(name,priority,fn)=>{hooks[name]=fn;}});
    const blit = () => hooks.DrawImageEx([player.Canvas,context.MainCanvas,500,0,{SourcePos:[0,100,500,1000],Width:500,Height:1000}],()=>17);
    assert.equal(hooks.DrawCharacter([player,500,0,1],blit),17);
    const view = api.shared.state.transformView;
    assert.equal(view.matrix.e,500); assert.equal(view.matrix.f,-100);
    hooks.DrawCharacter([{...player},0,0,1],blit);
    assert.equal(api.shared.state.transformView,view);
    api.shared.resetDragState();
    assert.equal(api.shared.state.transformView,null);
    assert.equal(api.shared.state.transformGeometry,null);
    assert.equal(api.shared.state.transformDragging,false);
});

test('captured GL atlas origin aligns the exact layer without blink or other-image pollution', () => {
    const {api,player,context} = session();
    const hooks = {}, canvas = {}, selected = item(); context.DialogFocusItem = selected;
    Object.assign(api.shared.state,{freeTransform:true,currentEditTexture:0});
    api.gizmo.setupTransformCapture({hookFunction:(name,priority,fn)=>{hooks[name]=fn;}});
    const geometry = {anchorX:50,anchorY:250,centerX:140,centerY:420,width:160,height:300};
    api.gizmo.drawCapturedTexture(player,selected,0,geometry,canvas,60,270,()=>{
        hooks.GLDraw2DCanvas([{}, {}, 900,900,999],()=>{});
        assert.equal(api.shared.state.transformGeometry.centerX,140);
        hooks.GLDraw2DCanvas([{},canvas,60,270,250],()=>{});
    });
    assert.equal(api.shared.state.transformGeometry.anchorX,300);
    assert.equal(api.shared.state.transformGeometry.centerX,390);
    hooks.GLDraw2DCanvas([{},canvas,60,270,1250],()=>{});
    assert.equal(api.shared.state.transformGeometry.centerX,390);
    const view = api.gizmo.imageMatrix({width:1000,height:1200},250,0,{SourcePos:[0,100,1000,1000],Width:1000,Height:1000});
    assert.equal(api.gizmo.mapPoint(view,390,420).x,640);
    assert.equal(api.gizmo.mapPoint(view,390,420).y,320);
});

test('resize cannot collapse either axis and preserves center at the minimum', () => {
    const {api} = session();
    const g = {anchorX:0,anchorY:0,centerX:100,centerY:200,width:100,height:200,sourceWidth:100,sourceHeight:200,rotation:0,minimumWidth:50,minimumHeight:50};
    for (const locked of [true,false]) {
        const values = api.gizmo.transformValues(g,{ScaleLocked:locked},{x:0,y:0},{x:-10000,y:-10000},'4');
        const w = Math.round(100*values.ScaleX/100), h = Math.round(200*values.ScaleY/100);
        assert.ok(w>=50 && h>=50);
        assert.equal(values.OffsetX+w/2,100); assert.equal(values.OffsetY+h/2,200);
        if (locked) assert.equal(values.ScaleX,values.ScaleY);
    }
});
