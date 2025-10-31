export class Best10_Results {
  id: string;
  gameID: string;
  resultID: string;
  totalStat: number;
  position: number;

  constructor(
    id: string,
    gameID: string,
    resultID: string,
    totalStat: number,
    position: number
  ) {
    this.id = id;
    this.gameID = gameID;
    this.resultID = resultID;
    this.totalStat = totalStat;
    this.position = position;
  }
}
