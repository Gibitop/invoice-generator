import type { FormData } from './form-data'
import { parseDate } from '@internationalized/date'
import { serializedFormDataSchema, formatZodErrors, type SerializedFormData } from './validation'

const STORAGE_KEY = 'invoice-form-data'

export function saveFormData(formData: FormData): void {
    try {
        const serializedData: SerializedFormData = {
            ...formData,
            invoice: {
                ...formData.invoice,
                date: formData.invoice.date.toString(),
                dueDate: formData.invoice.dueDate.toString()
            }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedData))
    } catch (error) {
        console.error('Failed to save form data:', error)
    }
}

export function loadFormData(): FormData | null {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY)
        if (!savedData) return null

        const parsed = JSON.parse(savedData)

        // Validate the loaded data
        const result = serializedFormDataSchema.safeParse(parsed)
        if (!result.success) {
            console.error('Invalid saved form data:', formatZodErrors(result.error))
            // Clear invalid data
            localStorage.removeItem(STORAGE_KEY)
            return null
        }

        return {
            ...result.data,
            invoice: {
                ...result.data.invoice,
                date: parseDate(result.data.invoice.date),
                dueDate: parseDate(result.data.invoice.dueDate)
            }
        }
    } catch (error) {
        console.error('Failed to load form data:', error)
        // Clear corrupted data
        localStorage.removeItem(STORAGE_KEY)
        return null
    }
}

export function clearFormData(): void {
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
        console.error('Failed to clear form data:', error)
    }
}

export function exportFormDataAsFile(formData: FormData, filename?: string): void {
    try {
        const serializedData: SerializedFormData = {
            ...formData,
            invoice: {
                ...formData.invoice,
                date: formData.invoice.date.toString(),
                dueDate: formData.invoice.dueDate.toString()
            }
        }

        const dataStr = JSON.stringify(serializedData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })

        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename || `invoice-${formData.invoice.number}-${new Date().toISOString().split('T')[0]}.json`
        link.click()

        URL.revokeObjectURL(url)
    } catch (error) {
        console.error('Failed to export form data:', error)
    }
}

export function importFormDataFromFile(): Promise<{ success: true; data: FormData } | { success: false; errors: string[] }> {
    return new Promise((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'

        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0]
            if (!file) {
                resolve({ success: false, errors: ['No file selected'] })
                return
            }

            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string
                    const parsed = JSON.parse(content)

                    // Validate the imported data
                    const result = serializedFormDataSchema.safeParse(parsed)
                    if (!result.success) {
                        resolve({ success: false, errors: formatZodErrors(result.error) })
                        return
                    }

                    const formData: FormData = {
                        ...result.data,
                        invoice: {
                            ...result.data.invoice,
                            date: parseDate(result.data.invoice.date),
                            dueDate: parseDate(result.data.invoice.dueDate)
                        }
                    }

                    resolve({ success: true, data: formData })
                } catch (error) {
                    console.error('Failed to parse imported file:', error)
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                    resolve({ success: false, errors: [`Failed to parse file: ${errorMessage}`] })
                }
            }

            reader.onerror = () => {
                resolve({ success: false, errors: ['Failed to read file'] })
            }

            reader.readAsText(file)
        }

        input.click()
    })
}