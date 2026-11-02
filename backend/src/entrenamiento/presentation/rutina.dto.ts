import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

// valida el formato (400). las reglas de negocio las valida el dominio
export class SerieDto {
  @IsOptional() @IsInt() @Min(1)
  repeticiones?: number;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @IsPositive()
  carga?: number;

  @IsOptional() @IsInt() @Min(1)
  duracion_segundos?: number;
}

export class EjercicioPlanificadoDto {
  @IsUUID()
  ejercicio_id!: string;

  @IsArray() @ValidateNested({ each: true }) @Type(() => SerieDto)
  series!: SerieDto[];
}

export class RutinaDto {
  @IsString()
  nombre!: string; 

  @IsArray() @ValidateNested({ each: true }) @Type(() => EjercicioPlanificadoDto)
  ejercicios!: EjercicioPlanificadoDto[];
}