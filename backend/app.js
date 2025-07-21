
require("./instrument.js");

const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const Sentry = require('@sentry/node');

const app = express();
Sentry.setupExpressErrorHandler(app);

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const skillRoutes = require('./routes/skillRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const likeRoutes = require('./routes/likeRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const setupSwagger = require('./swagger/swagger');

// 🟥 Sentry Init
Sentry.init({
  dsn: 'https://8ce71b849b0d16de52bb28f94a241f3e@o4509668567482368.ingest.de.sentry.io/4509668569841744',
  tracesSampleRate: 1.0,
  attachStacktrace: true,
  sendDefaultPii: true,
});


// Middlewares globaux
app.use(cors());
setupSwagger(app);

app.use(express.static(path.join(__dirname, 'frontend-build')));

(async () => {
  const AdminJS = (await import('adminjs')).default;
  const { DefaultAuthProvider } = await import('adminjs');
  const AdminJSExpress = (await import('@adminjs/express')).default;
  const AdminJSSequelize = (await import('@adminjs/sequelize')).default;

  const { sequelize, User, Notification, Skill, Like, Conversation, Appointment, Rating } = require('./models');
  const bcrypt = require('bcrypt');

  AdminJS.registerAdapter(AdminJSSequelize);

  await sequelize.sync();

  const adminExists = await User.findOne({ where: { role: 'admin' } });
  if (!adminExists) {
    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({
      email: 'admin@example.com',
      password: hashed,
      username: 'Default Admin',
      role: 'admin',
      isActive: true,
      profileToken: '',
    });
    console.log('✅ Admin par défaut créé : admin@example.com / admin123');
  }

  const { ComponentLoader } = require('adminjs');
  const getDashboardStats = require('./services/getDashboardStats');
  const getStripeStats = require('./services/getStripeStats');

  const componentLoader = new ComponentLoader();
  const customDashboard = componentLoader.add(
    'CustomDashboard',
    path.join(__dirname, 'components/Dashboard.jsx')
  );
  const customDashboard2 = componentLoader.add(
    'CustomDashboard2',
    path.join(__dirname, 'components/DashboardStats.jsx')
  );

  const adminJs = new AdminJS({
    dashboard: {
      handler: async () => {
        const stats = await getDashboardStats();
        const stats2 = await getStripeStats();
        return [stats, stats2];
      }
    },
    componentLoader,
    resources: [
      { resource: User, options: { navigation: 'Ressources' } },
      { resource: Notification, options: { navigation: 'Ressources' } },
      { resource: Skill, options: { navigation: 'Ressources' } },
      { resource: Like, options: { navigation: 'Ressources' } },
      { resource: Conversation, options: { navigation: 'Ressources' } },
      { resource: Appointment, options: { navigation: 'Ressources' } },
      { resource: Rating, options: { navigation: 'Ressources' } },
    ],
    pages: {
      StatistiquesUtilisation: {
        label: "Statistiques d'utilisation",
        component: customDashboard,
      },
      StatistiquesStripe: {
        label: "Statistiques stripe",
        component: customDashboard2,
      }
    },
    rootPath: '/admin',
    branding: {
      companyName: 'SkillsSwap'
    }
  });

  adminJs.watch();

  app.use(session({
    secret: 'adminjs-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }));

  const authProvider = new DefaultAuthProvider({
    authenticate: async ({ email, password }) => {
      const user = await User.findOne({ where: { email } });
      if (!user) return null;
      const ok = await bcrypt.compare(password, user.password);
      if (!ok || user.role !== 'admin') return null;
      return { email: user.email, role: user.role };
    },
  });

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    adminJs,
    { cookiePassword: 'adminjs-cookie-secret', provider: authProvider },
    null,
    { secret: 'adminjs-secret-key', resave: false, saveUninitialized: false }
  );

  app.use(adminJs.options.rootPath, adminRouter);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api', userRoutes);
  app.use('/api/skills', skillRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/likes', likeRoutes);
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/ratings', ratingRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/analytics', analyticsRoutes);
const SentryExpress = require('@sentry/express');


  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend-build', 'index.html'));
  });

  console.log(`✅ AdminJS disponible sur http://localhost:3000${adminJs.options.rootPath}`);
})();



module.exports = app;
