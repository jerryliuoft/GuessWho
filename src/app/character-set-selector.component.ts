import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  signal,
  computed,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface CharacterSet {
  name: string;
  characters: { name: string; imageUrl: string }[];
}

const DEMO_SET: CharacterSet = {
  name: 'Demo Set',
  characters: [
    {
      name: 'Alice',
      imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    { name: 'Bob', imageUrl: 'https://randomuser.me/api/portraits/men/65.jpg' },
    {
      name: 'Clara',
      imageUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
    },
    {
      name: 'David',
      imageUrl: 'https://randomuser.me/api/portraits/men/66.jpg',
    },
    {
      name: 'Eva',
      imageUrl: 'https://randomuser.me/api/portraits/women/66.jpg',
    },
    {
      name: 'Frank',
      imageUrl: 'https://randomuser.me/api/portraits/men/67.jpg',
    },
    {
      name: 'Grace',
      imageUrl: 'https://randomuser.me/api/portraits/women/67.jpg',
    },
    {
      name: 'Henry',
      imageUrl: 'https://randomuser.me/api/portraits/men/68.jpg',
    },
  ],
};

@Component({
  selector: 'character-set-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <form class="set-selector-form" autocomplete="off">
      <mat-form-field appearance="outline" class="set-select-field">
        <mat-label>Choose a character set</mat-label>
        <mat-select (selectionChange)="onSetChange($event)">
          @for (set of sets(); track set.name) {
          <mat-option [value]="set.name">{{ set.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <button
        mat-raised-button
        color="primary"
        component="label"
        class="upload-btn"
      >
        <mat-icon>upload</mat-icon>
        Upload Set
        <input
          type="file"
          accept="application/json,image/*"
          (change)="onFileUpload($event)"
          hidden
        />
      </button>
    </form>
  `,
  styles: [
    `
      .set-selector-form {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .set-select-field {
        min-width: 180px;
        max-width: 220px;
      }
      .upload-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
      }
    `,
  ],
})
export class CharacterSetSelectorComponent {
  private _sets = signal<CharacterSet[]>([
    DEMO_SET,
    { name: 'Classic', characters: [] },
    { name: 'Custom', characters: [] },
  ]);
  private _selectedSet = signal<CharacterSet | null>(DEMO_SET);

  @Output() output = new EventEmitter<CharacterSet>();

  sets = computed(() => this._sets());

  onSetChange(event: any) {
    const set = this._sets().find((s) => s.name === event.value);
    if (set) {
      this._selectedSet.set(set);
      this.output.emit(set);
    }
  }

  onFileUpload(event: Event) {
    // TODO: Implement file upload logic for custom sets
  }
}
