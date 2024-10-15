import { FC } from 'hono/jsx';

export const Form: FC = () => {
	return (
		<form
			hx-post="/"
			hx-target="#details"
			hx-swap="outerHTML"
			hx-on--after-request="this.reset()"
		>
			<label>
				How much did you spend today?
				<input name="amount" type="number" placeholder="100.00" step="any" />
				<input name="notes" type="text" placeholder="Notes" />
				<input type="submit" value="Submit" />
			</label>
		</form>
	);
};
