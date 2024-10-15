import { FC } from 'hono/jsx';
import { Budget } from '../db/schema';

export const BudgetForm: FC<Budget> = (budget) => {
	return (
		<form hx-patch="/manage/budget" hx-swap="outerHTML">
			<label>
				Budget
				<input
					name="amount"
					type="number"
					placeholder="100.00"
					step="any"
					id="budgetAmount"
					value={(budget.amount / 100).toFixed(2)}
				/>
			</label>
			<label>
				Daily Target
				<input
					name="dailyTarget"
					type="number"
					placeholder="100.00"
					step="any"
					id="dailyTarget"
					value={(budget.dailyTarget / 100).toFixed(2)}
				/>
			</label>
			<input type="submit" value="Update" />
		</form>
	);
};
