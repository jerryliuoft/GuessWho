import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

// Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';

import { CharacterSet } from '../models/character.model';
import { CharacterSetService } from '../character-set.service';
import { DEMO_SET } from '../models/character.model';

@Component({
  selector: 'character-set-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatGridListModule,
    MatMenuModule,
    RouterModule,
  ],
  templateUrl: './character-set-selector.component.html',
  styleUrls: ['./character-set-selector.component.scss'],
})
export class CharacterSetSelectorComponent {
  private characterSetService = inject(CharacterSetService);

  searchControl = new FormControl('');
  sortControl = new FormControl('recent'); // 'recent', 'asc', 'desc'

  // Convert valueChanges observables to signals
  searchTerm = toSignal(this.searchControl.valueChanges, { initialValue: '' });
  sortOrder = toSignal(this.sortControl.valueChanges, { initialValue: 'recent' });

  allSets = this.characterSetService.getCharacterSets();
  private _selectedSet = DEMO_SET;

  @Output() output = new EventEmitter<CharacterSet>();

  filteredAndSortedSets = computed(() => {
    let sets = this.allSets();
    const searchTerm = this.searchTerm()?.toLowerCase() || '';
    const sortOrder = this.sortOrder();

    // Filter
    if (searchTerm) {
      sets = sets.filter((set) =>
        set.name.toLowerCase().includes(searchTerm)
      );
    }

    // Sort
    if (sortOrder === 'asc') {
      sets = [...sets].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'desc') {
      sets = [...sets].sort((a, b) => b.name.localeCompare(a.name));
    }
    // 'recent' is default, no specific sort needed as allSets is already ordered by recency

    return sets;
  });

  onSetSelected(set: CharacterSet) {
    this._selectedSet = set;
    this.output.emit(set);
  }
}
