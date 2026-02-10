import { usePrincipal } from '../hooks/usePrincipal';

export interface ReminderPreferences {
  enabled: boolean;
  time: string;
}

const DEFAULT_PREFERENCES: ReminderPreferences = {
  enabled: false,
  time: '18:00',
};

function getStorageKey(principal: string): string {
  return `runmotivate_reminders_${principal}`;
}

export function getReminderPreferences(): ReminderPreferences {
  try {
    const principal = typeof window !== 'undefined' 
      ? (window as any).__currentPrincipal || 'guest'
      : 'guest';
    const key = getStorageKey(principal);
    const stored = localStorage.getItem(key);
    
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Failed to load reminder preferences:', error);
  }
  
  return DEFAULT_PREFERENCES;
}

export function saveReminderPreferences(preferences: ReminderPreferences): void {
  try {
    const principal = typeof window !== 'undefined'
      ? (window as any).__currentPrincipal || 'guest'
      : 'guest';
    const key = getStorageKey(principal);
    localStorage.setItem(key, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save reminder preferences:', error);
  }
}
