import {z} from 'zod';

export const messageSchema = z.object({
    content: z.string().min(6, { message: 'Message content is required' }).max(300, { message: 'Message content is too long' }),
});