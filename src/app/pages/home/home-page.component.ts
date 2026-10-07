import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ClientCardComponent } from '../../components/client-card/client-card.component';
import { HubHeaderComponent } from '../../components/hub-header/hub-header.component';
import { Client } from '../../models/client.model';
import { AuthService } from '../../services/auth.service';
import { ClientApiService } from '../../clients/client-api.service';

@Component({
  selector: 'app-home-page',
  imports: [HubHeaderComponent, ClientCardComponent],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly clientApi = inject(ClientApiService);

  readonly clients = signal<Client[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.clientApi
      .getClients()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (clients) => {
          this.clients.set(Array.isArray(clients) ? clients : []);
        },
        error: () => {
          this.errorMessage.set('No se pudieron cargar los clientes.');
        }
      });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
