
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
    ONEMONTH: '1개월',
    THREEMONTH: '3개월',
    SIXMONTH: '6개월',
    ONEYEAR: '1년',
    NONE: '횟수제',
};
