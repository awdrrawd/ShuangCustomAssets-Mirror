// No static imports: claim initialization before evaluating modules with side effects.
const key = "__ShuangAssetsStartup";
const alreadyRegistered = () => globalThis.bcModSdk?.getModsInfo?.().some(mod => mod.name === "ShuangCustomAssets") === true;
if (!globalThis[key] && !alreadyRegistered()) {
    // Publish the promise before any initialization executes, even when BC is already ready.
    globalThis[key] = Promise.resolve().then(async () => {
        // document-start loaders may execute before BC declares the functions used by the SDK.
        while (typeof LoginResponse !== "function" || typeof AssetGroup === "undefined"
            || typeof TextAllScreenCache === "undefined" || typeof CraftingLoadServer !== "function"
            || typeof AssetGet !== "function" || typeof GLDraw2DCanvas !== "function") {
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
