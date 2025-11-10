export interface DriverStats {
  seasonID: number;
  teamID: string;
  car_number: number; // Si no tenés este dato, podés dejarlo como opcional
  laps_led: number;
  fastest_laps: number;
  race_starts: number;
  poles: number;
  points: number;
  podiums: number;
  wins: number;
  standings: number;
  firstname: string;
  lastname: string;
}
