import { z } from 'zod'
import { currencyKeys } from './currency'

const senderSchema = z.object({
    name: z.string(),
    taxId: z.string(),
    address: z.string(),
    email: z.string(),
})

const invoiceSchema = z.object({
    number: z.number(),
    date: z.string(),
    dueDate: z.string(),
    terms: z.string(),
})

const recipientSchema = z.object({
    name: z.string(),
    address: z.string(),
})

const itemSchema = z.object({
    description: z.string(),
    hours: z.number(),
    rate: z.number(),
})

export const serializedFormDataSchema = z.object({
    sender: senderSchema,
    invoice: invoiceSchema,
    recipient: recipientSchema,
    items: z.array(itemSchema),
    currency: z.enum(currencyKeys),
    termsAndConditions: z.string(),
})

export type SerializedFormData = z.infer<typeof serializedFormDataSchema>

// Helper function to format Zod errors into readable strings
export function formatZodErrors(error: z.ZodError): string[] {
    return error.issues.map(issue => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'root'
        return `${path}: ${issue.message}`
    })
}