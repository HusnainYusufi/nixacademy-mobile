/**
 * Thin wrappers over Capacitor native plugins that degrade to no-ops in the
 * browser (so `npm run dev` and the visual-critic screenshots work unchanged).
 */
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export const isNative = Capacitor.isNativePlatform();

export async function initNative() {
  if (!isNative) return;
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#141210' });
  } catch {
    /* status bar not available (e.g. web) */
  }
  try {
    await SplashScreen.hide();
  } catch {
    /* no splash */
  }
}

export async function tapLight() {
  if (!isNative) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    /* ignore */
  }
}

export async function tapMedium() {
  if (!isNative) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    /* ignore */
  }
}
