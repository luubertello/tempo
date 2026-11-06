import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsUUID, Matches, ValidateNested } from 'class-validator';
import { EstadoSesion } from '../domain/estado-sesion';
import { SerieDto } from './rutina.dto';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

export class IniciarSesionDto {
  @IsOptional()
  @IsUUID()
  rutina_id?: string;
}

export class AgregarEjercicioDto {
  @IsUUID()
  ejercicio_id!: string;
}

export class SerieRealDto extends SerieDto {
  @IsOptional()
  @IsBoolean()
  completada?: boolean;
}

export class EjercicioRealDto {
  @IsUUID()
  ejercicio_id!: string;

  @IsOptional()
  @IsBoolean()
  omitido?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SerieRealDto)
  series!: SerieRealDto[];
}

export class SesionPasadaDto {
  @Matches(FECHA, { message: 'fecha_sesion debe tener el formato AAAA-MM-DD' })
  fecha_sesion!: string;

  @IsOptional()
  @IsUUID()
  rutina_id?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EjercicioRealDto)
  ejercicios!: EjercicioRealDto[];
}

export class CambiarFechaDto {
  @Matches(FECHA, { message: 'fecha_sesion debe tener el formato AAAA-MM-DD' })
  fecha_sesion!: string;
}

export class ListarSesionesDto {
  @IsOptional()
  @IsEnum(EstadoSesion)
  estado?: EstadoSesion;

  @IsOptional()
  @Matches(FECHA, { message: 'desde debe tener el formato AAAA-MM-DD' })
  desde?: string;

  @IsOptional()
  @Matches(FECHA, { message: 'hasta debe tener el formato AAAA-MM-DD' })
  hasta?: string;
}