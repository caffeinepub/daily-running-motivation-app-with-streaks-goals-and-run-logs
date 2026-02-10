import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Achievement {
    id: bigint;
    name: string;
    description: string;
    unlockedDate: bigint;
}
export interface RunLog {
    id: string;
    createdAt: bigint;
    unit: DistanceUnit;
    user: Principal;
    distance?: number;
    notes?: string;
    timestamp: bigint;
    timeMinutes: number;
}
export interface UserProfile {
    displayName?: string;
}
export interface Goal {
    createdAt: bigint;
    unit: DistanceUnit;
    targetTimeMinutes: number;
    targetDistance?: number;
}
export enum DistanceUnit {
    miles = "miles",
    meters = "meters",
    kilometers = "kilometers"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addRunLog(log: RunLog): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeGoal(_goalId: string): Promise<{
        achievements: Array<Achievement>;
    }>;
    deleteGoal(goalIdx: bigint): Promise<void>;
    getAchievements(_timeRangeInDays: bigint | null): Promise<Array<Achievement>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGoals(): Promise<Array<Goal>>;
    getMotivationMessage(): Promise<string>;
    getRunLogs(limit: bigint | null): Promise<Array<RunLog>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveDailyGoal(goal: Goal): Promise<void>;
}
