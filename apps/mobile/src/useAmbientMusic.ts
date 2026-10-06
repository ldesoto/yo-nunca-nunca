import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { playBed, stopBed } from './audio';

/** Música de fondo mientras esta pantalla está visible (Home, lobby, crear/unirse). */
export function useAmbientMusic() {
  useFocusEffect(
    useCallback(() => {
      void playBed();
      return () => {
        void stopBed();
      };
    }, []),
  );
}
