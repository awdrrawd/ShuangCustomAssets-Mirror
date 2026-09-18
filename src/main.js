// No static imports: claim initialization before evaluating modules with side effects.
const key = "__ShuangAssetsStartup";
const alreadyRegistered = () => globalThis.bcModSdk?.getModsInfo?.().some(mod => mod.name === "ShuangCustomAssets") === true;
if (!globalThis[key] && !alreadyRegistered()) {
    // Publish the promise before any initialization executes, even when BC is already ready.
    globalThis[key] = Promise.resolve().then(async () => {
        // document-start loaders may execute before BC declares the functions used by the SDK.
        // ChatRoomPublishCustomAction lives in Screens/Online/ChatRoom/ChatRoom.js, which is
        // declared after Scripts/*.js; AssetManager.init() hooks it, so waiting on it avoids
        // "Function ChatRoomPublishCustomAction to be patched not found" aborting the whole startup.
        while (typeof LoginResponse !== "function" || typeof AssetGroup === "undefined"
            || typeof TextAllScreenCache === "undefined" || typeof CraftingLoadServer !== "function"
            || typeof AssetGet !== "function" || typeof GLDraw2DCanvas !== "function"
            || typeof ChatRoomPublishCustomAction !== "function") {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        // An older loader may have registered while this bootstrap was waiting for BC.
        if (alreadyRegistered()) return;
        const app = await import("./app.js");
        await app.start();
    }).catch(error => {
        // A partially initialized mod must not be registered again by a fallback mirror.
        if (!alreadyRegistered()) delete globalThis[key];
        console.error("[ShuangAssets] Startup failed", error);
        throw error;
    });
}
await globalThis[key];
