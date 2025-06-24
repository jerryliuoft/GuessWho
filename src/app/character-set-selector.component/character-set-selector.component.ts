import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  inject,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CharacterSetService } from '../character-set.service';
import { CustomCharacterSetUploadComponent } from '../custom-character-set-upload.component/custom-character-set-upload.component';

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
    {
      name: 'Ivy',
      imageUrl: 'https://randomuser.me/api/portraits/women/69.jpg',
    },
    {
      name: 'Jack',
      imageUrl: 'https://randomuser.me/api/portraits/men/69.jpg',
    },
    {
      name: 'Karen',
      imageUrl: 'https://randomuser.me/api/portraits/women/70.jpg',
    },
    { name: 'Leo', imageUrl: 'https://randomuser.me/api/portraits/men/70.jpg' },
    {
      name: 'Mona',
      imageUrl: 'https://randomuser.me/api/portraits/women/71.jpg',
    },
    {
      name: 'Nate',
      imageUrl: 'https://randomuser.me/api/portraits/men/71.jpg',
    },
    {
      name: 'Olivia',
      imageUrl: 'https://randomuser.me/api/portraits/women/72.jpg',
    },
    {
      name: 'Paul',
      imageUrl: 'https://randomuser.me/api/portraits/men/72.jpg',
    },
    {
      name: 'Quinn',
      imageUrl: 'https://randomuser.me/api/portraits/women/73.jpg',
    },
    {
      name: 'Rick',
      imageUrl: 'https://randomuser.me/api/portraits/men/73.jpg',
    },
    {
      name: 'Sara',
      imageUrl: 'https://randomuser.me/api/portraits/women/74.jpg',
    },
    { name: 'Tom', imageUrl: 'https://randomuser.me/api/portraits/men/74.jpg' },
    {
      name: 'Uma',
      imageUrl: 'https://randomuser.me/api/portraits/women/75.jpg',
    },
    {
      name: 'Vince',
      imageUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
    },
    {
      name: 'Wendy',
      imageUrl: 'https://randomuser.me/api/portraits/women/76.jpg',
    },
    {
      name: 'Xander',
      imageUrl: 'https://randomuser.me/api/portraits/men/76.jpg',
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
  templateUrl: './character-set-selector.component.html',
  styleUrls: ['./character-set-selector.component.scss'],
})
export class CharacterSetSelectorComponent {
  private dialog = inject(MatDialog);
  private characterSetService = inject(CharacterSetService);

  sets = this.characterSetService.getCharacterSets();
  private _selectedSet = DEMO_SET;

  @Output() output = new EventEmitter<CharacterSet>();

  onSetChange(event: any) {
    const set = this.sets().find((s) => s.name === event.value);
    if (set) {
      this._selectedSet = set;
      this.output.emit(set);
    }
  }

  onCreateCustomSet() {
    this.dialog.open(CustomCharacterSetUploadComponent, {
      width: '600px',
      disableClose: false,
      autoFocus: true,
    });
  }
}
