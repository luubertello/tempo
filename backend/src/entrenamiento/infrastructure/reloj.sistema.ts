import { Reloj } from "../domain/reloj";

export class RelojSistema extends Reloj {
  constructor(private readonly zonaHoraria: string) {
    super();
  }

  hoy(): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: this.zonaHoraria }).format(new Date());
  }

  ahora(): Date {
    return new Date();
  }
}