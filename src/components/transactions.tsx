import { FC } from 'hono/jsx';
import { formatAmount } from '../utils/format';
import { Transaction } from '../db/schema';

export const Transactions: FC<{ transactions: Transaction[] }> = ({
	transactions,
}) => {
	return (
		<article id="transactions">
			<table class="striped">
				<thead>
					<tr>
						<th>Date</th>
						<th>Amount</th>
						<th>Notes</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{transactions.map(({ id, notes, user, amount, createdAt }) => (
						<tr>
							<td>{new Date(createdAt + 'Z').toLocaleDateString('en-US', {
								timeZone: 'America/New_York',
								year: 'numeric',
								month: 'numeric',
								day: 'numeric',
								hour: 'numeric',
								minute: 'numeric',
								second: 'numeric',
								hour12: true
							})}</td>
							<td>{formatAmount(amount)}</td>
							<td>
								{notes} ({user})
							</td>
							<td>
								<button
									hx-delete={`/manage/transaction/${id}`}
									hx-target="closest tr"
									hx-swap="delete"
								>
									Delete
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</article>
	);
};
