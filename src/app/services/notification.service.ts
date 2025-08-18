import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor(private snackBar: MatSnackBar) { }

    showSuccess(message: string, duration: number = 3000): void {
        this.snackBar.open(message, 'Close', {
            duration,
            panelClass: ['success-snackbar']
        });
    }

    showError(message: string, duration: number = 5000): void {
        this.snackBar.open(message, 'Close', {
            duration,
            panelClass: ['error-snackbar']
        });
    }

    showInfo(message: string, duration: number = 3000): void {
        this.snackBar.open(message, 'Close', {
            duration,
            panelClass: ['info-snackbar']
        });
    }

    showWarning(message: string, duration: number = 4000): void {
        this.snackBar.open(message, 'Close', {
            duration,
            panelClass: ['warning-snackbar']
        });
    }

    // Handle HTTP error responses and show appropriate error messages
    handleHttpError(error: HttpErrorResponse, defaultMessage: string = 'An error occurred'): void {
        let errorMessage = defaultMessage;

        if (error.error) {
            if (error.error.details) {
                // Handle 440 business error
                errorMessage = error.error.details;
            } else if (error.error.errors && error.error.errors.length > 0) {
                // Handle 400 validation errors
                errorMessage = error.error.errors[0].message;
            } else if (error.error.message) {
                // Handle other errors
                errorMessage = error.error.message;
            }
        }

        this.showError(errorMessage);
    }

    handleSuccess(response: any, defaultMessage: string = 'Operation completed successfully'): void {
        let successMessage = defaultMessage;

        if (response && response.message) {
            successMessage = response.message;
        }

        this.showSuccess(successMessage);
    }
}
