import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import {
  CharacterGridComponent,
  Character,
} from './character-grid.component/character-grid.component';
import {
  CharacterSetSelectorComponent,
  CharacterSet,
} from './character-set-selector.component/character-set-selector.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CharacterSetSelectorComponent,
    CharacterGridComponent,
    MatCardModule,
    MatDividerModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit {
  private _characters = signal<Character[]>([]);
  private _targetCharacter = signal<Character | null>(null);

  @ViewChild('grid') gridComponent?: CharacterGridComponent;

  characters = computed(() => this._characters());
  targetCharacter = computed(() => this._targetCharacter());

  ngAfterViewInit() {
    if (this.gridComponent) {
      this.gridComponent.input(this._characters());
    }
  }

  onSetSelected(set: CharacterSet) {
    this._characters.set(set.characters);
    if (set.characters.length > 0) {
      const randomIdx = Math.floor(Math.random() * set.characters.length);
      this._targetCharacter.set(set.characters[randomIdx]);
    } else {
      this._targetCharacter.set(null);
    }
    if (this.gridComponent) {
      this.gridComponent.input(set.characters);
    }
  }
}
