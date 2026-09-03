export const ACCOUNT_UPDATE_LIMIT = 180000;

export function packetBytes(packet) {
    return new TextEncoder().encode(JSON.stringify(packet)).byteLength;
}

export function extensionPacket(key, value) {
    return { [`ExtensionSettings.${key}`]: value };
}
