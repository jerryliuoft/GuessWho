import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CharacterSetSelectorComponent } from './character-set-selector.component/character-set-selector.component';
import { YourCharacterComponent } from './your-character.component';
import { CharacterGridComponent } from './character-grid.component/character-grid.component';
import { MatDividerModule } from '@angular/material/divider';
import { GameService } from './game.service';

@Component({
  selector: 'main-page',
  template: `
    <div class="set-selector-row">
      <character-set-selector
        (output)="onSetSelected($event)"
      ></character-set-selector>
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
  ],
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
  private gameService = inject(GameService);
  mysteryCharacter = this.gameService.mysteryCharacter;
  onSetSelected(set: unknown) {
    // Type narrowing for CharacterSet
    if (set && typeof set === 'object' && 'characters' in set) {
      this.gameService.loadSet(set as any); // Use as CharacterSet if you have the type imported
    }
  }
}
