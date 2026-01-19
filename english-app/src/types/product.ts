
export interface Product {
    id: number;
    name: string;
    price: number;
    amount: number;
    thumbnailUrl: string;
}

export type ProductType = 'SUBSCRIPTION' | 'ITEM';

export type LicensePeriod = 'ONEMONTH' | 'THREEMONTH' | 'SIXMONTH' | 'ONEYEAR' | 'NONE';

export const PERIOD_LABELS: Record<LicensePeriod, string> = {
    ONEMONTH: '1 month',
    THREEMONTH: '3 month',
    SIXMONTH: '6 month',
    ONEYEAR: '1 year',
    NONE: 'Frequency system',
};
