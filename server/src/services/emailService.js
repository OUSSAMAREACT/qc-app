import nodemailer from 'nodemailer';

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Helper to generate consistent HTML email layout
const getHtmlTemplate = (title, bodyContent) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const logoUrl = `${frontendUrl}/favicon.png`; // Assuming favicon.png is in public folder

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <img src="${logoUrl}" alt="QCMECHELLE11 Logo" style="width: 64px; height: 64px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h1 style="color: #1e40af; margin-top: 10px; font-size: 24px;">QCMECHELLE11</h1>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <h2 style="color: #111827; margin-top: 0; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">${title}</h2>
                <div style="color: #374151; line-height: 1.6; font-size: 16px;">
                    ${bodyContent}
                </div>
            </div>

            <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
                <p>&copy; ${new Date().getFullYear()} QCMECHELLE11. Tous droits réservés.</p>
                <p>L'équipe QCMECHELLE11</p>
            </div>
        </div>
    `;
};

export const sendConfirmationEmail = async (email, name) => {
    try {
        const html = getHtmlTemplate(`Bienvenue, ${name}!`, `
            <p>Merci de vous être inscrit sur notre plateforme.</p>
            <p>Votre compte a été créé avec succès.</p>
            <p>Vous pouvez maintenant vous connecter et commencer à préparer votre examen.</p>
            <br>
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Se connecter</a>
            </div>
        `);

        const info = await transporter.sendMail({
            from: '"QCMECHELLE11" <' + (process.env.EMAIL_FROM || process.env.EMAIL_USER) + '>',
            to: email,
            subject: "Confirmation d'inscription",
            html: html,
        });
        console.log("Confirmation email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending confirmation email:", error);
        return null;
    }
};

export const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

        const html = getHtmlTemplate("Réinitialisation de mot de passe", `
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Veuillez cliquer sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
            <br>
            <div style="text-align: center;">
                <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Réinitialiser mon mot de passe</a>
            </div>
            <br>
            <p style="font-size: 14px; color: #6b7280;">Ce lien est valide pour 1 heure.</p>
            <p style="font-size: 14px; color: #6b7280;">Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
        `);

        const info = await transporter.sendMail({
            from: '"QCMECHELLE11" <' + (process.env.EMAIL_FROM || process.env.EMAIL_USER) + '>',
            to: email,
            subject: "Réinitialisation de mot de passe",
            html: html,
        });
        console.log("Password reset email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw error;
    }
};

export const sendPaymentApprovedEmail = async (email, name, planType, expiresAt) => {
    try {
        const html = getHtmlTemplate("Paiement Approuvé !", `
            <p>Félicitations <strong>${name}</strong> !</p>
            <p>Votre paiement pour le plan <strong style="color: #2563eb;">${planType}</strong> a été validé avec succès.</p>
            <p>Vous avez désormais accès à tout le contenu Premium jusqu'au <strong>${new Date(expiresAt).toLocaleDateString()}</strong>.</p>
            <br>
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accéder à mon Dashboard</a>
            </div>
            <br>
            <p>Bon courage pour vos révisions !</p>
        `);

        const info = await transporter.sendMail({
            from: '"QCMECHELLE11" <' + (process.env.EMAIL_FROM || process.env.EMAIL_USER) + '>',
            to: email,
            subject: "Paiement Approuvé - Bienvenue Premium !",
            html: html,
        });
        console.log("Payment approved email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending payment approved email:", error);
        return null;
    }
};

export const sendReplyNotificationEmail = async (email, replierName, questionId) => {
    try {
        const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/result?questionId=${questionId}`;

        const html = getHtmlTemplate("Nouvelle réponse !", `
            <p><strong>${replierName}</strong> a répondu à une discussion que vous suivez.</p>
            <br>
            <div style="text-align: center;">
                <a href="${link}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Voir la réponse</a>
            </div>
        `);

        const info = await transporter.sendMail({
            from: '"QCMECHELLE11" <' + (process.env.EMAIL_FROM || process.env.EMAIL_USER) + '>',
            to: email,
            subject: "Nouvelle réponse à une discussion",
            html: html,
        });
        console.log("Reply notification email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending reply notification email:", error);
        return null;
    }
};

export const sendAnnouncementEmail = async (email, subject, message) => {
    try {
        const html = getHtmlTemplate(subject, `
            ${message}
        `);

        const info = await transporter.sendMail({
            from: '"QCMECHELLE11" <' + (process.env.EMAIL_FROM || process.env.EMAIL_USER) + '>',
            to: email,
            subject: subject,
            html: html,
        });
        console.log("Announcement email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending announcement email:", error);
        return null;
    }
};

export const sendReceiptUploadedEmail = async (adminEmail, studentName, planType) => {
    try {
        const html = getHtmlTemplate("Nouveau paiement en attente", `
            <p>L'étudiant <strong>${studentName}</strong> a téléchargé un reçu pour le plan <strong>${planType}</strong>.</p>
            <br>
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Voir les paiements</a>
            </div>
        `);

        const info = await transporter.sendMail({
            from: '"QCMECHELLE11 System" <' + (process.env.EMAIL_FROM || process.env.EMAIL_USER) + '>',
            to: adminEmail,
            subject: "Nouveau reçu de paiement téléchargé",
            html: html,
        });
        console.log("Receipt notification email sent to admin: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending receipt notification email:", error);
        return null;
    }
};
