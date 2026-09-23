import { Component } from '@angular/core';
import { ClientOperationsPageComponent } from '../client-operations/client-operations-page.component';

@Component({
  selector: 'app-cial-page',
  imports: [ClientOperationsPageComponent],
  template: `
    <div
      class="block [--dashboard-panel-bg:#00853f] [--dashboard-panel-border:#006f35] [--dashboard-panel-title:#fff]"
    >
      <app-client-operations-page
        clientId="cial"
        summaryTitle="Resumen Operativo CIAL"
        logoSrc="/assets/clients/cial-logo.png"
      />
    </div>
  `
})
export class CialPageComponent {}
