import { Component, input } from '@angular/core';
import {
  actionLabel,
  fieldLabel,
  formatAuditValue,
  formatDateTime
} from '../../gobierno/gobierno.format';
import { AuditLog } from '../../gobierno/gobierno.types';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html'
})
export class AuditLogComponent {
  readonly logs = input.required<AuditLog[]>();
  readonly formatDateTime = formatDateTime;
  readonly formatAuditValue = formatAuditValue;
  readonly actionLabel = actionLabel;
  readonly fieldLabel = fieldLabel;
}
