const app = require('./app');

// 🔐 PORT depuis variable d’environnement ou défaut 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📘 Swagger dispo sur http://localhost:${PORT}/api-docs`);
});
