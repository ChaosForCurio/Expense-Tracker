import { Expense } from '@/types';

export const MOCK_EXPENSES: Expense[] = [
    {
        id: 'mock-1',
        title: 'Starbucks Coffee',
        amount: 450,
        date: new Date().toISOString(),
        category: 'Food',
        note: 'Morning coffee',
        user_id: 'demo-user',
        image_url: ''
    },
    {
        id: 'mock-2',
        title: 'Uber Ride',
        amount: 250,
        date: new Date().toISOString(),
        category: 'Transport',
        note: 'Commute to office',
        user_id: 'demo-user',
        image_url: ''
    },
    {
        id: 'mock-3',
        title: 'Netflix Subscription',
        amount: 799,
        date: new Date(new Date().setMonth(new Date().getMonth() - 0)).toISOString(),
        category: 'Entertainment',
        user_id: 'demo-user',
        image_url: ''
    },
    {
        id: 'mock-4',
        title: 'Grocery Store',
        amount: 3500,
        date: new Date().toISOString(),
        category: 'Shopping',
        user_id: 'demo-user',
        image_url: ''
    },
    {
        id: 'mock-5',
        title: 'Electric Bill',
        amount: 1500,
        date: new Date(new Date().setDate(5)).toISOString(),
        category: 'Utilities',
        user_id: 'demo-user',
        image_url: ''
    },
    {
        id: 'mock-6',
        title: 'Gym Membership',
        amount: 2000,
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        category: 'Health',
        user_id: 'demo-user',
        image_url: ''
    },
    {
        id: 'mock-7',
        title: 'Amazon Shopping',
        amount: 4500,
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        category: 'Shopping',
        user_id: 'demo-user',
        image_url: ''
    },
    {
        id: 'mock-8',
        title: 'Dinner at Taj',
        amount: 2800,
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        category: 'Food',
        user_id: 'demo-user',
        image_url: ''
    },
    {
        id: 'mock-9',
        title: 'Fuel',
        amount: 3000,
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        category: 'Transport',
        user_id: 'demo-user',
        image_url: ''
    }
];
