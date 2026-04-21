export interface CameraAvailability {
  available: boolean;
  label: string;
}

export async function checkCameraAvailability(): Promise<CameraAvailability> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return {
      available: false,
      label: "El navegador embebido no expone acceso a webcam."
    };
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const camera = devices.find((device) => device.kind === "videoinput");

    if (!camera) {
      return {
        available: false,
        label: "No se detectó ninguna webcam disponible."
      };
    }

    return {
      available: true,
      label: camera.label || "Webcam disponible"
    };
  } catch (error) {
    return {
      available: false,
      label: error instanceof Error ? error.message : "No se pudo enumerar la webcam."
    };
  }
}

export async function requestCameraStream() {
  return navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 24 }
    },
    audio: false
  });
}

export function stopCameraStream(stream?: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}
