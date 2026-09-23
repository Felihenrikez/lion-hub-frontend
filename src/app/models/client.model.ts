export interface Client {
  id: string;
  name: string;
  subtitle: string;
  deployTotal: number;
  deployOk: number;
  deployError: number;
  topMensajeria: number;
  topMensajeriaFlow: string;
  jobsFailed: number;
  interfacesFailed: number;
  certDaysToExpire: number;
}
