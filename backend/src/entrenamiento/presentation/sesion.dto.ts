import { IsOptional, IsUUID } from 'class-validator';

export class IniciarSesionDto {
  @IsOptional()
  @IsUUID()
  rutina_id?: string;
}

export class AgregarEjercicioDto {
  @IsUUID()
  ejercicio_id!: string;
}

