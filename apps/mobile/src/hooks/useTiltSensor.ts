import { useState, useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';

export const useTiltSensor = (
  onTiltDown: () => void,
  onTiltUp: () => void,
  isActive: boolean
) => {
  const [subscription, setSubscription] = useState<any>(null);

  // Un simple debounce para evitar que un mismo movimiento dispare múltiples veces
  const [canTrigger, setCanTrigger] = useState(true);

  useEffect(() => {
    if (!isActive) {
      if (subscription) {
        subscription.remove();
        setSubscription(null);
      }
      return;
    }

    // Configurar la frecuencia de actualización (cada 150ms es suficiente)
    Accelerometer.setUpdateInterval(150);

    const sub = Accelerometer.addListener(({ x, y, z }) => {
      if (!canTrigger) return;

      // El celular puesto en la frente en modo apaisado:
      // Cuando se inclina hacia abajo (acierto), el eje 'z' se hace fuertemente positivo o 'y' cambia significativamente.
      // Dependiendo del dispositivo, la lectura en apaisado varía.
      // Por convención simple:
      if (z > 0.6) {
        // Inclinación hacia abajo (boca abajo)
        setCanTrigger(false);
        onTiltDown();
        setTimeout(() => setCanTrigger(true), 1500); // Esperar 1.5s antes del próximo
      } else if (z < -0.6) {
        // Inclinación hacia arriba (hacia el techo)
        setCanTrigger(false);
        onTiltUp();
        setTimeout(() => setCanTrigger(true), 1500);
      }
    });

    setSubscription(sub);

    return () => {
      sub.remove();
      setSubscription(null);
    };
  }, [isActive, canTrigger, onTiltDown, onTiltUp]);

  return null;
};
