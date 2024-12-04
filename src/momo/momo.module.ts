import { Module, Global } from '@nestjs/common';
import { MomoService } from './momo.service';

@Global() // Rend le service disponible dans toute l'application
@Module({
  providers: [MomoService],
  exports: [MomoService], // Permet de l'importer dans d'autres modules
})
export class MomoModule {}
