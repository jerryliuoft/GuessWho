import {
  Component,
  ChangeDetectionStrategy,
  inject,
  Input,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crop-dialog',
  standalone: true,
  imports: [ImageCropperComponent, MatButtonModule, CommonModule],
  template: `
    <h2 style="margin-bottom:1rem;">Crop Image</h2>
    <image-cropper
      [imageChangedEvent]="imageChangedEvent"
      [maintainAspectRatio]="true"
      [aspectRatio]="1"
      format="png"
      (imageCropped)="onCropped($event)"
      [resizeToWidth]="256"
      [resizeToHeight]="256"
      style="max-width:320px;display:block;margin:0 auto;"
    ></image-cropper>
    <div
      style="display:flex;gap:1rem;justify-content:center;margin-top:1.5rem;"
    >
      <button mat-raised-button color="primary" (click)="confirmCrop()">
        Crop
      </button>
      <button mat-button (click)="cancel()">Cancel</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CropDialogComponent {
  @Input() imageChangedEvent: any;
  croppedImage: string | null = null;
  private dialogRef = inject(MatDialogRef<CropDialogComponent>);

  onCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64 ?? null;
  }

  confirmCrop() {
    this.dialogRef.close(this.croppedImage);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
