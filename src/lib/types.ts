export type Stats = {
	spentSoFar: number;
	currentBalance: number;
	percentRemaining: string;
	avgDailySpend: number;
	dailyTarget: number;
	lastThirtyAvgDailySpend?: number;
	projectedBalance: number;
	projectedReward: number;
	projectedSavings: number;
};
