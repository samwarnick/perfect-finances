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
						<th>Entered by</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{transactions.map(({ id, user, amount, createdAt }) => (
						<tr>
							<td>{createdAt}</td>
							<td>{formatAmount(amount)}</td>
							<td>{user}</td>
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
