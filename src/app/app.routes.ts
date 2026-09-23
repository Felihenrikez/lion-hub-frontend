import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { HomePageComponent } from './pages/home/home-page.component';
import { LoginPageComponent } from './pages/login/login-page.component';
import { EmbonorPageComponent } from './pages/embonor/embonor-page.component';
import { EmbolPageComponent } from './pages/embol/embol-page.component';
import { PolpaicoPageComponent } from './pages/polpaico/polpaico-page.component';
import { CialPageComponent } from './pages/cial/cial-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: '', component: HomePageComponent, canActivate: [authGuard] },
  { path: 'client/embonor', component: EmbonorPageComponent, canActivate: [authGuard] },
  { path: 'client/embol', component: EmbolPageComponent, canActivate: [authGuard] },
  { path: 'client/polpaico', component: PolpaicoPageComponent, canActivate: [authGuard] },
  { path: 'client/cial', component: CialPageComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
