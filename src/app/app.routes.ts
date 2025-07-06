import { Routes } from '@angular/router';

import { CustomCharacterSetUploadPage } from './custom-character-set-upload.page/custom-character-set-upload.page';

import { MainPageComponent } from './main-page.component';

export const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'create-set', component: CustomCharacterSetUploadPage },
];
