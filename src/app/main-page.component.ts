import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CharacterSetSelectorComponent } from './character-set-selector.component/character-set-selector.component';
import { YourCharacterComponent } from './your-character.component';
import { CharacterGridComponent } from './character-grid.component/character-grid.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { GameService } from './game.service';
import { CharacterSet } from './models/character.model';

@Component({
  selector: 'main-page',
  template: `
    <div class="set-selector-row">
      <character-set-selector
        (output)="onSetSelected($event)"
      ></character-set-selector>
      <button mat-raised-button color="primary" (click)="startGame()" class="start-game-button">Start New Game</button>
    </div>
    <your-character [character]="mysteryCharacter()"></your-character>
    <mat-divider class="divider"></mat-divider>
    <section class="character-grid-section">
      <character-grid></character-grid>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CharacterSetSelectorComponent,
    YourCharacterComponent,
    CharacterGridComponent,
    MatDividerModule,
    MatButtonModule,
  ],
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
  private gameService = inject(GameService);
  mysteryCharacter = this.gameService.mysteryCharacter;
  onSetSelected(set: CharacterSet) {
    this.gameService.loadSet(set);
  }

  startGame() {
    this.gameService.startGame();
  }
}
