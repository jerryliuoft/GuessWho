import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CharacterGridComponent } from './character-grid.component/character-grid.component';
import { CharacterSetSelectorComponent } from './character-set-selector.component/character-set-selector.component';
import { CharacterSet } from './models/character.model';
import { DEMO_SET } from './models/character.model';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { YourCharacterComponent } from './your-character.component';
import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';
import { inject } from '@angular/core';
import { GameService } from './game.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CharacterSetSelectorComponent,
    CharacterGridComponent,
    YourCharacterComponent,
    ToastComponent,
    MatCardModule,
    MatDividerModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    RouterOutlet,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  toast = new ToastService();
  gameService = inject(GameService);

  constructor() {
    // Load default character set on app start
    this.gameService.loadSet(DEMO_SET);
  }

  onSetSelected(set: CharacterSet) {
    this.gameService.loadSet(set);
  }

  /**
   * Returns true if the current route is a full-page routed view (e.g. /create-set),
   * so the main game UI should be hidden and only the routed content shown.
   * This is used to keep the layout consistent and avoid duplicate content.
   */
  isRoutedPage(): boolean {
    // Simple check: if the current URL is /create-set, hide the main game UI
    // (You can expand this logic for more routed pages in the future)
    return window.location.pathname.startsWith('/create-set');
  }
}
