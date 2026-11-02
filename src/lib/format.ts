export function formatAmount(amount: number): string {
	const sign = amount < 0 ? '-' : '';
	const formatted = (Math.abs(amount) / 100)
		.toFixed(2)
		.replace(/\d(?=(\d{3})+\.)/g, '$&,');

	return `${sign}$${formatted}`;
}
