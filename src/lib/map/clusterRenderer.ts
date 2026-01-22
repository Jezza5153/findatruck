// src/lib/map/clusterRenderer.ts
import { MARKER_ASSETS, MARKER_SIZES } from "@/lib/map/markers"

export function makeClusterRenderer() {
    return {
        render: ({ count, position }: { count: number; position: google.maps.LatLng }) => {
            const size = MARKER_SIZES.cluster

            return new google.maps.Marker({
                position,
                icon: {
                    url: MARKER_ASSETS.cluster,
                    scaledSize: new google.maps.Size(size, size),
                    anchor: new google.maps.Point(size / 2, size / 2),
                    labelOrigin: new google.maps.Point(size / 2, size / 2),
                },
                label: {
                    text: String(count),
                    color: "#1F1F1F",
                    fontSize: "12px",
                    fontWeight: "700",
                },
                zIndex: 1000 + count,
            })
        },
    }
}
