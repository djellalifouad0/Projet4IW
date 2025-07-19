const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // ou ton SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendWelcomeEmail = async (to, username) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Bienvenue sur MyApp',
    text: `Bonjour ${username},\n\nBienvenue sur MyApp !`
  });
};

exports.sendPasswordResetEmail = async (to, resetLink) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Réinitialisation de mot de passe',
    text: `Bonjour,\n\nCliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}\n\nSi ce n'est pas vous, ignorez cet email.`
  });
};
