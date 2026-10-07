import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HubHeaderComponent } from '../../components/hub-header/hub-header.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-portal-page',
  imports: [RouterLink, HubHeaderComponent],
  templateUrl: './portal-page.component.html'
})
export class PortalPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
