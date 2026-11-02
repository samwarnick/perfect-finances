import { DateTime } from 'luxon';

export const APP_ZONE = 'America/New_York';
export const DB_FORMAT = 'yyyy-MM-dd HH:mm:ss';

/** The month key ('YYYY-MM') for a moment in the app's timezone. */
export function currentMonth(): string {
	return DateTime.now().setZone(APP_ZONE).toFormat('yyyy-MM');
}

export function monthLabel(month: string): string {
	return DateTime.fromFormat(month, 'yyyy-MM', { zone: APP_ZONE }).toFormat(
		'LLLL yyyy',
	);
}

export function previousMonth(month: string): string {
	return DateTime.fromFormat(month, 'yyyy-MM', { zone: APP_ZONE })
		.minus({ months: 1 })
		.toFormat('yyyy-MM');
}

/** UTC timestamps bounding the month, ready to compare against created_at. */
export function monthRange(month: string): { start: string; end: string } {
	const start = DateTime.fromFormat(month, 'yyyy-MM', {
		zone: APP_ZONE,
	}).startOf('month');

	return {
		start: start.toUTC().toFormat(DB_FORMAT),
		end: start.endOf('month').toUTC().toFormat(DB_FORMAT),
	};
}

export function monthOfTimestamp(timestamp: string): string {
	return DateTime.fromFormat(timestamp, DB_FORMAT, { zone: 'utc' })
		.setZone(APP_ZONE)
		.toFormat('yyyy-MM');
}

export function daysInMonth(month: string): number {
	return (
		DateTime.fromFormat(month, 'yyyy-MM', { zone: APP_ZONE }).daysInMonth ?? 30
	);
}

/** Days of the month that have happened so far, at least one. */
export function daysElapsedInMonth(month: string): number {
	if (month !== currentMonth()) {
		return daysInMonth(month);
	}

	return Math.max(1, DateTime.now().setZone(APP_ZONE).day);
}

/** Whole days left in the month, zero for months that are over. */
export function daysLeftInMonth(month: string): number {
	if (month !== currentMonth()) {
		return 0;
	}

	const now = DateTime.now().setZone(APP_ZONE);
	const end = DateTime.fromFormat(month, 'yyyy-MM', { zone: APP_ZONE }).endOf(
		'month',
	);

	return Math.max(0, Math.ceil(end.diff(now, 'days').days));
}

export function nowTimestamp(): string {
	return DateTime.now().setZone(APP_ZONE).toUTC().toFormat(DB_FORMAT);
}

export function daysAgoTimestamp(days: number): string {
	return DateTime.now()
		.setZone(APP_ZONE)
		.minus({ days })
		.toUTC()
		.toFormat(DB_FORMAT);
}
