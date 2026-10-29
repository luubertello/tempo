import { SetMetadata } from '@nestjs/common';

export const ES_PUBLICO = 'esPublico';
// Marca un endpoint como accesible sin token
export const Publico = () => SetMetadata(ES_PUBLICO, true);