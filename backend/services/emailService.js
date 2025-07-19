const { Resend } = require('resend');

const resend = new Resend(process.env.MAIL_KEY);

export async function sendAccountValidationEmail(to, username, link) {
  const { error } = await resend.emails.send({
    from: 'SkillSwap <onboarding@resend.dev>',
    to,
    subject: 'Bienvenue sur SkillSwap — Validez votre compte',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #333;">Bienvenue sur <span style="color: #4CAF50;">SkillSwap</span>, ${username} 👋</h2>
        <p>Merci pour votre inscription.</p>
        <p>Pour activer votre compte, cliquez sur le bouton ci-dessous :</p>
        <p style="text-align: center;">
          <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; font-size: 16px;">
            Activer mon compte
          </a>
        </p>
        <p style="font-size: 12px; color: #777;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
      </div>
    `
  });

  if (error) {
    console.error('❌ Erreur envoi email validation:', error);
    throw new Error('Failed to send account validation email');
  }
}

export async function sendResetPasswordEmail(to, username, link) {
  const { error } = await resend.emails.send({
    from: 'SkillSwap <onboarding@resend.dev>',
    to,
    subject: '🔑 Réinitialisation de votre mot de passe',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #333;">Réinitialisation du mot de passe</h2>
        <p>Bonjour ${username},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Pour continuer, cliquez sur le bouton ci-dessous :</p>
        <p style="text-align: center;">
          <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; font-size: 16px;">
            Réinitialiser mon mot de passe
          </a>
        </p>
        <p style="font-size: 12px; color: #777;">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
      </div>
    `
  });

  if (error) {
    console.error('❌ Erreur envoi email reset password:', error);
    throw new Error('Failed to send reset password email');
  }
}
