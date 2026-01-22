// src/lib/map/network.ts
export type NetworkSafety = {
    saveData: boolean
    effectiveType?: string
    isSlow: boolean
}

/**
 * Detect slow network conditions and Data Saver mode.
 * Defensive for browsers that don't support navigator.connection.
 */
export function getNetworkSafety(): NetworkSafety {
    // navigator.connection is not supported everywhere, so be defensive.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav: any = typeof navigator !== "undefined" ? navigator : null
    const conn = nav?.connection || nav?.mozConnection || nav?.webkitConnection

    const saveData = !!conn?.saveData
    const effectiveType = conn?.effectiveType as string | undefined
    const isSlow = saveData || effectiveType === "2g" || effectiveType === "slow-2g"

    return { saveData, effectiveType, isSlow }
}
