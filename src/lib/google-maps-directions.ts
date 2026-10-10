export type GoogleMapsDestination = {
  coordinates?: [number, number] | null;
  address?: string | null;
  label?: string | null;
};

function destinationParam({
  coordinates,
  address,
  label,
}: GoogleMapsDestination): string | null {
  if (
    coordinates &&
    Number.isFinite(coordinates[0]) &&
    Number.isFinite(coordinates[1]) &&
    (Math.abs(coordinates[0]) > 0.001 || Math.abs(coordinates[1]) > 0.001)
  ) {
    return `${coordinates[0]},${coordinates[1]}`;
  }
  const text = address?.trim() || label?.trim();
  return text || null;
}

export function canOpenGoogleMapsDirections(destination: GoogleMapsDestination) {
  return Boolean(destinationParam(destination));
}

/** Opens Google Maps directions: user location → listing destination. */
export function openGoogleMapsDirections(destination: GoogleMapsDestination) {
  const dest = destinationParam(destination);
  if (!dest) return;

  const open = (origin?: string) => {
    const params = new URLSearchParams({
      api: "1",
      destination: dest,
      travelmode: "driving",
    });
    if (origin) params.set("origin", origin);
    window.open(
      `https://www.google.com/maps/dir/?${params.toString()}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  if (typeof navigator === "undefined" || !navigator.geolocation) {
    open("Current Location");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      open(`${position.coords.latitude},${position.coords.longitude}`);
    },
    () => {
      open("Current Location");
    },
    { enableHighAccuracy: false, timeout: 4000, maximumAge: 60_000 },
  );
}
