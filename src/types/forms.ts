// src/types/forms.ts

// Shared type for the state returned by form server actions
export type ActionFormState = {
    error: string | null;
    success?: boolean;
}; 