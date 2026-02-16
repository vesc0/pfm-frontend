import { Component } from "@angular/core";
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { TransactionsService } from "../../services/transactions.service";
import { NotificationService } from "../../services/notification.service";

@Component({
    selector: 'app-cat-rules-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, NgIf],
    templateUrl: './cat-rules-dialog.html',
    styleUrl: './cat-rules-dialog.scss'
})
export class CatRulesDialog {
    selectedFile: File | null = null;
    selectedFileName: string | null = null;
    uploading = false;

    constructor(
        public dialogRef: MatDialogRef<CatRulesDialog>,
        private transactionService: TransactionsService,
        private notificationService: NotificationService
    ) { }

    onFileSelected(fileInput: HTMLInputElement) {
        const file = fileInput.files?.[0];
        if (file) {
            this.selectedFile = file;
            this.selectedFileName = file.name;
        } else {
            this.selectedFile = null;
            this.selectedFileName = null;
        }
    }

    uploadFile(fileInput: HTMLInputElement) {
        if (!this.selectedFile) {
            this.notificationService.showWarning('Please select a YAML file first');
            return;
        }

        this.uploading = true;
        const formData = new FormData();
        formData.append('file', this.selectedFile);

        this.transactionService.autoCategorizeUpload(formData).subscribe({
            next: (response) => {
                this.notificationService.showSuccess('Categorization rules uploaded successfully!');
                this.dialogRef.close();
                //window.location.reload(); // Refresh the page to show updated transactions
            },
            error: (error) => {
                this.uploading = false;
                this.notificationService.handleHttpError(error, 'Failed to upload categorization rules');
            }
        });
    }
}