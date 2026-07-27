export type ReservationFilter = 'all' | 'pending' | 'completed' | 'expired';

export type ReadinessItem = {
  label: string;
  done: boolean;
  value: string | number;
  actionLabel: string;
  actionPath: string;
};
