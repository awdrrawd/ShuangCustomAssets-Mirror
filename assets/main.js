const key = "__ShuangAssetsStartup";
const alreadyRegistered = () => globalThis.bcModSdk?.getModsInfo?.().some(mod => mod.name === "ShuangCustomAssets") === true;
if (!globalThis[key] && !alreadyRegistered()) {
    globalThis[key] = Promise.resolve().then(async () => {
        while (typeof LoginResponse !== "function" || typeof AssetGroup === "undefined"
            || typeof TextAllScreenCache === "undefined" || typeof CraftingLoadServer !== "function"
            || typeof AssetGet !== "function" || typeof GLDraw2DCanvas !== "function") {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        if (alreadyRegistered()) return;
        const app = await import('./app-C4oQjrq7.js');
        await app.start();
    }).catch(error => {
        if (!alreadyRegistered()) delete globalThis[key];
        console.error("[ShuangAssets] Startup failed", error);
        throw error;
    });
}
await globalThis[key];
