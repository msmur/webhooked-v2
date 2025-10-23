import { z } from 'zod';

export const ErrorSchema = z.object({
    error: z.string().describe('Error code representing the type of error'),
    message: z.string().describe('Detailed error message'),
});
