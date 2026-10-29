import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();
import DataSource from './data-source'; 

console.log("Iniciando prueba manual...");

DataSource.initialize()
  .then(async () => {
    console.log("✅ Conexión inicializada exitosamente.");
    console.log("✅ Entidades cargadas:", DataSource.entityMetadatas.map(e => e.tableName));
    console.log("✅ Migraciones encontradas:", DataSource.migrations.length);
    
    // Forzamos a que muestre el listado
    await DataSource.showMigrations();
    
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error CRÍTICO detectado al intentar cargar:");
    console.error(error);
    process.exit(1);
  });