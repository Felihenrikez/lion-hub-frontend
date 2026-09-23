import { Component } from '@angular/core';
import { ClientOperationsPageComponent } from '../client-operations/client-operations-page.component';

@Component({
  selector: 'app-embol-page',
  imports: [ClientOperationsPageComponent],
  template: `
    <div
      class="block [--dashboard-panel-bg:#f40009] [--dashboard-panel-border:#c70008] [--dashboard-panel-title:#fff]"
    >
      <app-client-operations-page
        clientId="embol"
        summaryTitle="Resumen Operativo Embol"
        logoSrc="/assets/clients/embol-logo.png"
      />
    </div>
  `
})
export class EmbolPageComponent {}
