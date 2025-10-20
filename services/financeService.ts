import { Client, Databases, ID, Query } from 'appwrite';
import { config } from '../config';
import { Invoice, Expense, RecurringInvoice, RecurringExpense, Budget, Project } from '../types';

const client = new Client()
    .setEndpoint(config.APPWRITE_ENDPOINT)
    .setProject(config.APPWRITE_PROJECT_ID);

const databases = new Databases(client);

const INVOICES_COLLECTION_ID = config.INVOICES_COLLECTION_ID;
const EXPENSES_COLLECTION_ID = config.EXPENSES_COLLECTION_ID;
const RECURRING_INVOICES_COLLECTION_ID = config.RECURRING_INVOICES_COLLECTION_ID;
const RECURRING_EXPENSES_COLLECTION_ID = config.RECURRING_EXPENSES_COLLECTION_ID;
const BUDGETS_COLLECTION_ID = config.BUDGETS_COLLECTION_ID;
const DATABASE_ID = config.APPWRITE_DATABASE_ID;

interface AppwriteDocument {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    $collectionId: string;
    $databaseId: string;
}

// Helper to convert Appwrite document to our type
const fromAppwriteDocument = <T>(doc: AppwriteDocument & T): T => {
    const { $id, $createdAt, $updatedAt, $permissions, $collectionId, $databaseId, ...rest } = doc;
    return { ...rest, id: $id } as T;
};

export const financeService = {
    // --- Invoices ---
    async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                INVOICES_COLLECTION_ID,
                ID.unique(),
                {
                    ...invoice,
                    amount: Number(invoice.amount),
                    paidAmount: invoice.paidAmount ? Number(invoice.paidAmount) : null,
                    receipt: invoice.receipt ? JSON.stringify(invoice.receipt) : null, // Store receipt as JSON string
                }
            );
            return fromAppwriteDocument(response) as Invoice;
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw error;
        }
    },

    async getInvoices(): Promise<Invoice[]> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                INVOICES_COLLECTION_ID,
                [Query.orderDesc('$createdAt')]
            );
            return response.documents.map(doc => {
                const invoice = fromAppwriteDocument(doc) as Invoice;
                if (doc.receipt && typeof doc.receipt === 'string') {
                    invoice.receipt = JSON.parse(doc.receipt);
                }
                return invoice;
            });
        } catch (error) {
            console.error('Error getting invoices:', error);
            return [];
        }
    },

    async updateInvoice(invoice: Invoice): Promise<Invoice> {
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                INVOICES_COLLECTION_ID,
                invoice.id,
                {
                    ...invoice,
                    amount: Number(invoice.amount),
                    paidAmount: invoice.paidAmount ? Number(invoice.paidAmount) : null,
                    receipt: invoice.receipt ? JSON.stringify(invoice.receipt) : null,
                }
            );
            return fromAppwriteDocument(response) as Invoice;
        } catch (error) {
            console.error('Error updating invoice:', error);
            throw error;
        }
    },

    async deleteInvoice(id: string): Promise<void> {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                INVOICES_COLLECTION_ID,
                id
            );
        } catch (error) {
            console.error('Error deleting invoice:', error);
            throw error;
        }
    },

    // --- Expenses ---
    async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                EXPENSES_COLLECTION_ID,
                ID.unique(),
                {
                    ...expense,
                    amount: Number(expense.amount),
                    receipt: expense.receipt ? JSON.stringify(expense.receipt) : null,
                }
            );
            return fromAppwriteDocument(response) as Expense;
        } catch (error) {
            console.error('Error creating expense:', error);
            throw error;
        }
    },

    async getExpenses(): Promise<Expense[]> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                EXPENSES_COLLECTION_ID,
                [Query.orderDesc('$createdAt')]
            );
            return response.documents.map(doc => {
                const expense = fromAppwriteDocument(doc) as Expense;
                if (doc.receipt && typeof doc.receipt === 'string') {
                    expense.receipt = JSON.parse(doc.receipt);
                }
                return expense;
            });
        } catch (error) {
            console.error('Error getting expenses:', error);
            return [];
        }
    },

    async updateExpense(expense: Expense): Promise<Expense> {
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                EXPENSES_COLLECTION_ID,
                expense.id,
                {
                    ...expense,
                    amount: Number(expense.amount),
                    receipt: expense.receipt ? JSON.stringify(expense.receipt) : null,
                }
            );
            return fromAppwriteDocument(response) as Expense;
        } catch (error) {
            console.error('Error updating expense:', error);
            throw error;
        }
    },

    async deleteExpense(id: string): Promise<void> {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                EXPENSES_COLLECTION_ID,
                id
            );
        } catch (error) {
            console.error('Error deleting expense:', error);
            throw error;
        }
    },

    // --- Recurring Invoices ---
    async createRecurringInvoice(recurringInvoice: Omit<RecurringInvoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<RecurringInvoice> {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                RECURRING_INVOICES_COLLECTION_ID,
                ID.unique(),
                {
                    ...recurringInvoice,
                    amount: Number(recurringInvoice.amount),
                }
            );
            return fromAppwriteDocument(response) as RecurringInvoice;
        } catch (error) {
            console.error('Error creating recurring invoice:', error);
            throw error;
        }
    },

    async getRecurringInvoices(): Promise<RecurringInvoice[]> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                RECURRING_INVOICES_COLLECTION_ID,
                [Query.orderDesc('$createdAt')]
            );
            return response.documents.map(doc => fromAppwriteDocument(doc) as RecurringInvoice);
        } catch (error) {
            console.error('Error getting recurring invoices:', error);
            return [];
        }
    },

    async updateRecurringInvoice(recurringInvoice: RecurringInvoice): Promise<RecurringInvoice> {
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                RECURRING_INVOICES_COLLECTION_ID,
                recurringInvoice.id,
                {
                    ...recurringInvoice,
                    amount: Number(recurringInvoice.amount),
                }
            );
            return fromAppwriteDocument(response) as RecurringInvoice;
        } catch (error) {
            console.error('Error updating recurring invoice:', error);
            throw error;
        }
    },

    async deleteRecurringInvoice(id: string): Promise<void> {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                RECURRING_INVOICES_COLLECTION_ID,
                id
            );
        } catch (error) {
            console.error('Error deleting recurring invoice:', error);
            throw error;
        }
    },

    // --- Recurring Expenses ---
    async createRecurringExpense(recurringExpense: Omit<RecurringExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<RecurringExpense> {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                RECURRING_EXPENSES_COLLECTION_ID,
                ID.unique(),
                {
                    ...recurringExpense,
                    amount: Number(recurringExpense.amount),
                }
            );
            return fromAppwriteDocument(response) as RecurringExpense;
        } catch (error) {
            console.error('Error creating recurring expense:', error);
            throw error;
        }
    },

    async getRecurringExpenses(): Promise<RecurringExpense[]> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                RECURRING_EXPENSES_COLLECTION_ID,
                [Query.orderDesc('$createdAt')]
            );
            return response.documents.map(doc => fromAppwriteDocument(doc) as RecurringExpense);
        } catch (error) {
            console.error('Error getting recurring expenses:', error);
            return [];
        }
    },

    async updateRecurringExpense(recurringExpense: RecurringExpense): Promise<RecurringExpense> {
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                RECURRING_EXPENSES_COLLECTION_ID,
                recurringExpense.id,
                {
                    ...recurringExpense,
                    amount: Number(recurringExpense.amount),
                }
            );
            return fromAppwriteDocument(response) as RecurringExpense;
        } catch (error) {
            console.error('Error updating recurring expense:', error);
            throw error;
        }
    },

    async deleteRecurringExpense(id: string): Promise<void> {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                RECURRING_EXPENSES_COLLECTION_ID,
                id
            );
        } catch (error) {
            console.error('Error deleting recurring expense:', error);
            throw error;
        }
    },

    // --- Budgets ---
    async createBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                BUDGETS_COLLECTION_ID,
                ID.unique(),
                {
                    ...budget,
                    totalAmount: Number(budget.totalAmount),
                    spentAmount: Number(budget.spentAmount),
                    budgetLines: budget.budgetLines ? JSON.stringify(budget.budgetLines) : null, // Store as JSON string
                }
            );
            return fromAppwriteDocument(response) as Budget;
        } catch (error) {
            console.error('Error creating budget:', error);
            throw error;
        }
    },

    async getBudgets(): Promise<Budget[]> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                BUDGETS_COLLECTION_ID,
                [Query.orderDesc('$createdAt')]
            );
            return response.documents.map(doc => {
                const budget = fromAppwriteDocument(doc) as Budget;
                if (doc.budgetLines && typeof doc.budgetLines === 'string') {
                    budget.budgetLines = JSON.parse(doc.budgetLines);
                }
                return budget;
            });
        } catch (error) {
            console.error('Error getting budgets:', error);
            return [];
        }
    },

    async updateBudget(budget: Budget): Promise<Budget> {
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                BUDGETS_COLLECTION_ID,
                budget.id,
                {
                    ...budget,
                    totalAmount: Number(budget.totalAmount),
                    spentAmount: Number(budget.spentAmount),
                    budgetLines: budget.budgetLines ? JSON.stringify(budget.budgetLines) : null,
                }
            );
            return fromAppwriteDocument(response) as Budget;
        } catch (error) {
            console.error('Error updating budget:', error);
            throw error;
        }
    },

    async deleteBudget(id: string): Promise<void> {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                BUDGETS_COLLECTION_ID,
                id
            );
        } catch (error) {
            console.error('Error deleting budget:', error);
            throw error;
        }
    },
};
