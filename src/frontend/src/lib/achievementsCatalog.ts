export interface AchievementCatalog {
  id: bigint;
  name: string;
  description: string;
}

export const achievementsCatalog: AchievementCatalog[] = [
  {
    id: BigInt(0),
    name: 'First Run',
    description: 'Completed your first run',
  },
  {
    id: BigInt(1),
    name: '3 Day Streak',
    description: 'Ran 3 days in a row',
  },
  {
    id: BigInt(2),
    name: '7 Day Streak',
    description: 'Ran 7 days in a row',
  },
  {
    id: BigInt(3),
    name: 'Marathon',
    description: 'Completed a marathon distance',
  },
  {
    id: BigInt(4),
    name: '30 Day Warrior',
    description: 'Ran 30 days in a row',
  },
  {
    id: BigInt(5),
    name: '100 Runs',
    description: 'Logged 100 total runs',
  },
];
