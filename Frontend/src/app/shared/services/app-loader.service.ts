import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AppLoaderComponent } from '../components/partials/app-loader/app-loader.component';

@Injectable({
  providedIn: 'root',
})
export class AppLoaderService {
  dialogRef: MatDialogRef<AppLoaderComponent>;
  constructor(private dialog: MatDialog) {}

  public open(): Observable<boolean> {
    this.dialogRef = this.dialog.open(AppLoaderComponent, {
      disableClose: true,
      panelClass: 'loading-panel',
    });
    this.dialogRef.updateSize('200px');
    return this.dialogRef.afterClosed();
  }

  public close() {
    if (this.dialogRef) this.dialogRef.close();
    return this.dialogRef;
  }
}
