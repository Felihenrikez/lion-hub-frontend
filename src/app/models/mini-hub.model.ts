export interface MiniHubItem {
  label: string;
  value: string | number;
  subtitle?: string;
  tone?: 'primary' | 'success' | 'danger' | 'neutral';
}
