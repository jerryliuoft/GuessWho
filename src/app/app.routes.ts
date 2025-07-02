import { Routes } from '@angular/router';

import { CustomCharacterSetUploadComponent } from './custom-character-set-upload.component/custom-character-set-upload.component';

import { MainPageComponent } from './main-page.component';

export const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'create-set', component: CustomCharacterSetUploadComponent },
];
