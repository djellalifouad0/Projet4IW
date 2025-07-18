
const express = require('express');

const path = require('path');
const cors = require('cors');
const session = require('express-session');

const app = express();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const skillRoutes = require('./routes/skillRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const likeRoutes = require('./routes/likeRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');


const setupSwagger = require('./swagger/swagger');


app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

//  Swagger

const { profile } = require('console');
setupSwagger(app);

//  Servir le frontend
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ratings', ratingRoutes);



app.use('/api/analytics', analyticsRoutes);


setupSwagger(app);

app.use(express.static(path.join(__dirname, 'frontend-build')));

(async () => {
  const AdminJS = (await import('adminjs')).default;
  const { DefaultAuthProvider } = await import('adminjs');
  const AdminJSExpress = (await import('@adminjs/express')).default;
  const AdminJSSequelize = (await import('@adminjs/sequelize')).default;

  const { sequelize, User } = require('./models');
  const bcrypt = require('bcrypt');

  AdminJS.registerAdapter(AdminJSSequelize);

  // 🔷 Créer admin par défaut si aucun admin
  await sequelize.sync(); // s'assurer que la DB est prête

  const existingAdmin = await User.findOne({ where: { role: 'admin' } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      email: 'admin@example.com',
      password: hashedPassword,
      username: 'Default Admin',
      role: 'admin',
      isActive: true,
      profileToken: ""
    });
    console.log('✅ Admin par défaut créé : admin@example.com / admin123');
  } else {
    console.log(`ℹ️ Admin déjà existant : ${existingAdmin.email}`);
  }

  const adminJs = new AdminJS({
    databases: [sequelize],
    rootPath: '/admin',
    branding: {
      companyName: 'MySQL Admin Dashboard',
    },
  });

  // 📝 Session
  app.use(session({
    secret: 'adminjs-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // true si HTTPS
  }));
app.use(express.static(path.join(__dirname, 'frontend-build')));

  // 📝 AuthProvider
  const authProvider = new DefaultAuthProvider({
    authenticate: async ({ email, password }) => {
      console.log(`🟢 authenticate() appelé avec ${email}`);
      const user = await User.findOne({ where: { email } });
      if (!user) {
        console.log(`🚨 Utilisateur ${email} non trouvé`);
        return null;
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        console.log(`🚨 Mot de passe invalide pour ${email}`);
        return null;
      }

      if (user.role !== 'admin') {
        console.log(`🚨 Rôle invalide pour ${email}`);
        return null;
      }

      console.log(`✅ Utilisateur ${email} authentifié`);
      return { email: user.email, role: user.role };
    },
  });

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    adminJs,
    {
      cookiePassword: 'adminjs-cookie-secret',
      provider: authProvider,
    },
    null,
    {
      secret: 'adminjs-secret-key',
      resave: false,
      saveUninitialized: false,
    }
  );

  app.use(adminJs.options.rootPath, adminRouter);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
// Si aucune route API ne correspond, retourne index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend-build', 'index.html'));
});
  console.log(`✅ AdminJS disponible sur http://localhost:3000${adminJs.options.rootPath}`);
})();

// Routes API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/userRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/likes', require('./routes/likeRoutes'));
app.use('/api/conversations', require('./routes/conversationRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));

// Frontend fallback

module.exports = app;


