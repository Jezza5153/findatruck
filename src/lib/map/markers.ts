// src/lib/map/markers.ts
export type FindATruckMarkerState = {
    isSelected?: boolean
    isEvent?: boolean
    isBusy?: boolean
    isOpen?: boolean
    isClosed?: boolean
    isFeatured?: boolean
    isUser?: boolean
}

export type MarkerContext = {
    zoom?: number
    noAnimation?: boolean
}

/**
 * Change this ONE line if your files are in /public/markers instead of /public/brand/markers
 */
export const MARKERS_BASE_PATH = "/markers"

export const MARKER_ASSETS = {
    cluster: `${MARKERS_BASE_PATH}/cluster.svg`,
    eventDefault: `${MARKERS_BASE_PATH}/event-default.svg`,

    // Default should be static (svg). If you only have gif right now, set this to .gif.
    truckDefault: `${MARKERS_BASE_PATH}/truck-default.svg`,
    truckOpen: `${MARKERS_BASE_PATH}/truck-open.gif`,
    truckBusy: `${MARKERS_BASE_PATH}/truck-busy.gif`,
    truckSelected: `${MARKERS_BASE_PATH}/truck-selected.gif`,
    truckClosed: `${MARKERS_BASE_PATH}/truck-closed.svg`,

    user: `${MARKERS_BASE_PATH}/user-marker.svg`,
} as const

export const MARKER_SIZES = {
    default: 40,
    active: 48,
    selected: 56,
    user: 32,
    cluster: 38,
} as const

export function getMarkerSize(state: FindATruckMarkerState): number {
    if (state.isSelected) return MARKER_SIZES.selected
    if (state.isUser) return MARKER_SIZES.user
    if (state.isEvent || state.isOpen || state.isBusy || state.isFeatured) return MARKER_SIZES.active
    return MARKER_SIZES.default
}

function animationAllowed(ctx?: MarkerContext): boolean {
    if (ctx?.noAnimation) return false
    if (typeof ctx?.zoom !== "number") return true
    return ctx.zoom >= 14
}

/**
 * State priority:
 * selected → event → featured → busy → open → closed → default
 */
export function getMarkerAsset(state: FindATruckMarkerState, ctx?: MarkerContext): string {
    if (state.isUser) return MARKER_ASSETS.user
    if (state.isSelected) {
        // P1: Selected marker also obeys zoom downgrade
        return animationAllowed(ctx) ? MARKER_ASSETS.truckSelected : MARKER_ASSETS.truckDefault
    }
    if (state.isEvent) return MARKER_ASSETS.eventDefault

    const allowGif = animationAllowed(ctx)

    if (state.isFeatured) return MARKER_ASSETS.truckDefault
    if (state.isBusy) return allowGif ? MARKER_ASSETS.truckBusy : MARKER_ASSETS.truckDefault
    if (state.isOpen) return allowGif ? MARKER_ASSETS.truckOpen : MARKER_ASSETS.truckDefault
    if (state.isClosed) return MARKER_ASSETS.truckClosed

    return MARKER_ASSETS.truckDefault
}

export function makeGoogleMapsIcon(assetUrl: string, size: number): google.maps.Icon {
    return {
        url: assetUrl,
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(size / 2, size), // bottom center
    }
}
