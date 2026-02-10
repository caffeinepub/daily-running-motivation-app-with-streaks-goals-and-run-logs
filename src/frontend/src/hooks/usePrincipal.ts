import { useInternetIdentity } from './useInternetIdentity';

export function usePrincipal(): string {
  const { identity } = useInternetIdentity();
  
  if (!identity) {
    return 'guest';
  }
  
  return identity.getPrincipal().toString();
}
