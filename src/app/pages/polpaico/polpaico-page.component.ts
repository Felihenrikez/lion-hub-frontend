import { Component } from '@angular/core';
import { ClientOperationsPageComponent } from '../client-operations/client-operations-page.component';

@Component({
  selector: 'app-polpaico-page',
  imports: [ClientOperationsPageComponent],
  template: `
    <div
      class="block [--dashboard-panel-bg:#0f5593] [--dashboard-panel-border:#0c4578] [--dashboard-panel-title:#fff]"
    >
      <app-client-operations-page
        clientId="polpaico"
        summaryTitle="Resumen Operativo Polpaico"
        logoSrc="/assets/clients/polpaico-logo.png"
      />
    </div>
  `
})
export class PolpaicoPageComponent {}
