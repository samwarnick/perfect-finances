import { FC } from 'hono/jsx';

export const Form: FC = () => {
	return (
		<form hx-post="/" hx-target="#details" hx-swap="outerHTML">
			<label>
				How much did you spend today?
				<fieldset role="group">
					<input name="amount" type="number" placeholder="100.00" step="any" />
					<input type="submit" value="Submit" />
				</fieldset>
			</label>
		</form>
	);
};
