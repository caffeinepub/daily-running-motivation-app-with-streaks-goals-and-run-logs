import { RunLog, DistanceUnit } from '../backend';

export function computeTodayCompleted(runLogs: RunLog[]): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime() * 1_000_000;

  return runLogs.some((log) => {
    const logDate = new Date(Number(log.timestamp) / 1_000_000);
    logDate.setHours(0, 0, 0, 0);
    return logDate.getTime() * 1_000_000 >= todayTimestamp;
  });
}

export function computeStreak(runLogs: RunLog[]): number {
  if (runLogs.length === 0) return 0;

  const dayMap = new Map<string, boolean>();
  
  runLogs.forEach((log) => {
    const date = new Date(Number(log.timestamp) / 1_000_000);
    const dateKey = date.toISOString().split('T')[0];
    dayMap.set(dateKey, true);
  });

  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateKey = checkDate.toISOString().split('T')[0];
    
    if (dayMap.has(dateKey)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function formatDistanceDisplay(distance: number, unit: DistanceUnit): string {
  const unitLabels = {
    [DistanceUnit.kilometers]: 'km',
    [DistanceUnit.miles]: 'mi',
    [DistanceUnit.meters]: 'm',
  };
  
  return `${distance.toFixed(2)} ${unitLabels[unit]}`;
}
