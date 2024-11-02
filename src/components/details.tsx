import { FC } from 'hono/jsx';
import { formatAmount } from '../utils/format';
import { Stats } from '../utils/stats';

export const Details: FC<Stats> = (stats) => {
	return (
		<article id="details" style="font-variant-numeric: tabular-nums">
			<div class="grid">
				<div>
					<strong>{formatAmount(stats.currentBalance)} Remaining</strong>
				</div>
				<div style="text-align: right">
					<span>{formatAmount(stats.spentSoFar)} Spent</span>
				</div>
			</div>
			<progress value={stats.percentRemaining} max="100" />
			<details>
				<ul>
					<li>
						Avg. daily spend: {formatAmount(stats.avgDailySpend)}{' '}
						<small>
							({stats.avgDailySpend > 7525 ? 'Above' : 'Below'} target of
							{formatAmount(stats.dailyTarget)})
						</small>
					</li>
					{stats.lastThirtyAvgDailySpend && (
						<li>
							Last 30 days avg. spend:{' '}
							{formatAmount(stats.lastThirtyAvgDailySpend)}
						</li>
					)}
					<li>Projected balance: {formatAmount(stats.projectedBalance)}</li>
					<li>
						Could mean and extra {formatAmount(stats.projectedReward)} in fun
						money and {formatAmount(stats.projectedSavings)} more saved!
					</li>
				</ul>
			</details>
		</article>
	);
};
