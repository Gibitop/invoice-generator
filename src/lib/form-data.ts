import type { CurrencyKey } from "./currency";
import type { DateValue } from "@internationalized/date";

export type FormData = {
    sender: {
        name: string;
        taxId: string;
        address: string;
        email: string;
    }

    invoice: {
        number: number;
        date: DateValue;
        dueDate: DateValue;
        terms: string;
    }

    recipient: {
        name: string;
        address: string;
    }

    items: {
        description: string;
        hours: number;
        rate: number;
    }[]
    currency: CurrencyKey;

    termsAndConditions: string;
}