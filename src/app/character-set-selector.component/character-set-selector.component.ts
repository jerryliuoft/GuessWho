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
import { RouterModule } from '@angular/router';
import { CharacterSet } from '../models/character.model';
import { CharacterSetService } from '../character-set.service';
import { DEMO_SET } from '../models/character.model';
import { CustomCharacterSetUploadPage } from '../custom-character-set-upload.page/custom-character-set-upload.page';

@Component({
  selector: 'character-set-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
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
}
