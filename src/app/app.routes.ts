import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { HomePageComponent } from './pages/home/home-page.component';
import { LoginPageComponent } from './pages/login/login-page.component';
import { PortalPageComponent } from './pages/portal/portal-page.component';
import { GobiernoListPageComponent } from './pages/gobierno/gobierno-list-page.component';
import { GobiernoDetailPageComponent } from './pages/gobierno/gobierno-detail-page.component';
import { EmbonorPageComponent } from './pages/embonor/embonor-page.component';
import { EmbolPageComponent } from './pages/embol/embol-page.component';
import { PolpaicoPageComponent } from './pages/polpaico/polpaico-page.component';
import { CialPageComponent } from './pages/cial/cial-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: '', component: PortalPageComponent, canActivate: [authGuard] },
  { path: 'checklist', component: HomePageComponent, canActivate: [authGuard] },
  { path: 'gobierno', component: GobiernoListPageComponent, canActivate: [authGuard] },
  { path: 'gobierno/:id', component: GobiernoDetailPageComponent, canActivate: [authGuard] },
  { path: 'client/embonor', component: EmbonorPageComponent, canActivate: [authGuard] },
  { path: 'client/embol', component: EmbolPageComponent, canActivate: [authGuard] },
  { path: 'client/polpaico', component: PolpaicoPageComponent, canActivate: [authGuard] },
  { path: 'client/cial', component: CialPageComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
