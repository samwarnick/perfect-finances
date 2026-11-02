import type { z } from 'zod';

type ParseResult<T extends z.ZodTypeAny> =
	{ success: true; data: z.infer<T> } | { success: false; issues: string[] };

export function parseForm<T extends z.ZodTypeAny>(
	schema: T,
	formData: FormData,
): ParseResult<T> {
	const result = schema.safeParse(Object.fromEntries(formData));

	if (!result.success) {
		return {
			success: false,
			issues: result.error.issues.map((issue) => issue.message),
		};
	}

	return { success: true, data: result.data };
}
