import { createContext, useContext } from 'react';

/**
 * On web, sheets must mount inside the phone screen so the frame can clip
 * them. React Native's Modal portals to the document root, which escapes the
 * frame entirely, so the browser preview supplies a host node here instead.
 *
 * Native has no host: Modal is the right primitive on a real device.
 */
export const OverlayHostContext = createContext<unknown>(null);

export function useOverlayHost(): unknown {
  return useContext(OverlayHostContext);
}
