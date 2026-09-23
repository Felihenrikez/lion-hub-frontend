import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppButtonComponent } from '../../components/app-button/app-button.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, AppButtonComponent],
  templateUrl: './login-page.component.html',
  host: {
    class: 'grid min-h-[calc(100vh-2.4rem)] place-items-center'
  }
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  username = '';
  password = '';
  errorMessage = '';
  loading = false;

  submit(): void {
    this.errorMessage = '';
    this.loading = true;

    this.auth.login(this.username, this.password).subscribe({
      next: (logged) => {
        this.loading = false;

        if (!logged) {
          this.errorMessage = 'Credenciales invalidas.';
          return;
        }

        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo conectar con el servidor.';
      }
    });
  }
}
