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
const dashboardRoutes = require('./routes/dashboardRoutes');

const setupSwagger = require('./swagger/swagger');

// CORS + Swagger
app.use(cors());
setupSwagger(app);

// Servir le frontend build (sera fallback plus bas aussi)
app.use(express.static(path.join(__dirname, 'frontend-build')));

(async () => {

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

  const AdminJS = (await import('adminjs')).default;
  const { DefaultAuthProvider } = await import('adminjs');
  const AdminJSExpress = (await import('@adminjs/express')).default;
  const AdminJSSequelize = (await import('@adminjs/sequelize')).default;

  const { sequelize, User } = require('./models');
  const bcrypt = require('bcrypt');

  AdminJS.registerAdapter(AdminJSSequelize);

  await sequelize.sync();

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

  const { Notification, Skill, Like, Conversation, Appointment, Rating } = require('./models');
  const { ComponentLoader } = require('adminjs');
  const componentLoader = new ComponentLoader();
  const getDashboardStats = require('./services/getDashboardStats');
  const getStripeStats = require('./services/getStripeStats');

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
   
        return [
          
          stats,stats2]
     
      }, 
     
    },
    
    componentLoader,
    resources: [

  { 
    resource: User, 
    options: { navigation: 'Ressources' } 
  },
  { 
    resource: Notification, 
    options: { navigation: 'Ressources' } 
  },
  { 
    resource: Skill, 
    options: { navigation: 'Ressources' } 
  },
  { 
    resource: Like, 
    options: { navigation: 'Ressources' } 
  },
  { 
    resource: Conversation, 
    options: { navigation: 'Ressources' } 
  },
  { 
    resource: Appointment, 
    options: { navigation: 'Ressources' } 
  },
  { 
    resource: Rating, 
    options: { navigation: 'Ressources' } 
  }
],
    
    pages: {
      StatistiquesUtilisation: {
        label: "Statistiques d'utilisation",
        component: customDashboard,
      }, StatistiquesStripe: {
        label: "Statistiques stripe",
        component: customDashboard2,
      }
    },
    rootPath: '/admin',
    branding: {
      companyName: 'SkillsSwap',
    }
  });

  adminJs.watch();

  app.use(session({
    secret: 'adminjs-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // true si HTTPS
  }));

  const authProvider = new DefaultAuthProvider({
    authenticate: async ({ email, password }) => {
      const user = await User.findOne({ where: { email } });
      if (!user) return null;

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch || user.role !== 'admin') return null;

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

  // 🚨 Après AdminJS :
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Tes routes API

  // fallback frontend SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend-build', 'index.html'));
  });

  console.log(`✅ AdminJS disponible sur http://localhost:3000${adminJs.options.rootPath}`);
})();

module.exports = app;
