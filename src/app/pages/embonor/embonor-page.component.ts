import { Component } from '@angular/core';
import { ClientOperationsPageComponent } from '../client-operations/client-operations-page.component';

@Component({
  selector: 'app-embonor-page',
  imports: [ClientOperationsPageComponent],
  template: `
    <div
      class="block [--dashboard-panel-bg:#f40009] [--dashboard-panel-border:#c70008] [--dashboard-panel-title:#fff]"
    >
      <app-client-operations-page
        clientId="embonor"
        summaryTitle="Resumen Operativo Embonor"
        logoSrc="/assets/clients/embonor-logo.png"
      />
    </div>
  `
})
export class EmbonorPageComponent {}
