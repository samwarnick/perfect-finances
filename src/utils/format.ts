export function formatAmount(amount: number): string {
	return `$${(amount / 100).toFixed(2)}`.replace(/\d(?=(\d{3})+\.)/g, '$&,');
}
