import 'dotenv/config';
import app from './app';
import { connectDB } from './config/db';

const PORT = Number(process.env.PORT ?? 4000);

async function main() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Backend Rently corriendo en http://localhost:${PORT}`);
    console.log(`   Entorno: ${process.env.NODE_ENV ?? 'development'}`);
  });
}

main().catch((err) => {
  console.error('❌ Error al iniciar el servidor:', err);
  process.exit(1);
});
