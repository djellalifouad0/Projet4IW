
const express = require('express');

const path = require('path');
const cors = require('cors');
const session = require('express-session');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
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
    console.log('Admin par défaut créé : / admin123');
  } else {
    console.log(`ℹAdmin déjà existant : ${existingAdmin.email}`);
  }
  
  
  const {  Notification, Skill, Like, Conversation, Appointment, Rating } = require('./models');
const { ComponentLoader } = require('adminjs')
const componentLoader = new ComponentLoader()
const path = require('path');
const getDashboardStats = require('./services/getDashboardStats')

const Components = {
    Dashboard:path.join(__dirname, 'components', 'Dashboard.jsx')
  // autres composants ici
}

const customDashboard = componentLoader.add(
  'CustomDashboard', 
  path.join(__dirname, 'components/Dashboard.jsx')
);
  const adminJs = new AdminJS({
    dashboard: { 
      
      handler: async () => {
       const stats = await getDashboardStats()
    return stats
      }
    
    
    },
     component: customDashboard,
  
  componentLoader,
      resources: [
    { resource: User },
    { resource: Notification },
    { resource: Skill },
    { resource: Like },
    { resource: Conversation },
    { resource: Appointment },
    { resource: Rating },
  ],
pages: {
    customPage: {
      label: 'Page Custom',
      component: customDashboard,
    
       
    },
  },
    rootPath: '/admin',
    branding: {
      companyName: 'SkillsSwap',
    },
   componentLoader,

  });
  
  adminJs.watch()

  app.use(session({
    secret: 'adminjs-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // true si HTTPS
  }));

  const authProvider = new DefaultAuthProvider({
    authenticate: async ({ email, password }) => {
      console.log(`authenticate() appelé avec ${email}`);
      const user = await User.findOne({ where: { email } });
      if (!user) {
        console.log(`Utilisateur ${email} non trouvé`);
        return null;
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        console.log(`Mot de passe invalide pour ${email}`);
        return null;
      }

      if (user.role !== 'admin') {
        console.log(`Rôle invalide pour ${email}`);
        return null;
      }

      console.log(`Utilisateur ${email} authentifié`);
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
  app.use(express.static(path.join(__dirname, 'frontend-build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend-build', 'index.html'));
  }); 

  console.log(`AdminJS disponible sur http://localhost:3000${adminJs.options.rootPath}`);
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
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
// Frontend fallback

module.exports = app;


