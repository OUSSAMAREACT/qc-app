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

export const sendConfirmationEmail = async (email, name) => {
    try {
        const info = await transporter.sendMail({
            from: '"QCMECHELLE11" <' + (process.env.EMAIL_FROM || process.env.EMAIL_USER) + '>', // sender address
            to: email, // list of receivers
            subject: "Confirmation d'inscription", // Subject line
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Bienvenue sur QC App, ${name}!</h2>
                    <p>Merci de vous être inscrit sur notre plateforme.</p>
                    <p>Votre compte a été créé avec succès.</p>
                    <p>Vous pouvez maintenant vous connecter et commencer à utiliser l'application.</p>
                    <br>
                    <p>Cordialement,</p>
                    <p>L'équipe QCMECHELLE11</p>
                </div>
            `, // html body
        });
        console.log("Confirmation email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending confirmation email:", error);
        // Don't throw error to prevent blocking registration if email fails
        return null;
    }
};

export const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        // Assuming frontend URL is in env or hardcoded for now
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

        const info = await transporter.sendMail({
            from: '"QCMECHELLE11" <' + (process.env.EMAIL_FROM || process.env.EMAIL_USER) + '>',
            to: email,
            subject: "Réinitialisation de mot de passe",
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Réinitialisation de mot de passe</h2>
                    <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                    <p>Veuillez cliquer sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
                    <p><a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a></p>
                    <p>Ce lien est valide pour 1 heure.</p>
                    <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
                    <br>
                    <p>Cordialement,</p>
                    <p>L'équipe QCMECHELLE11</p>
                </div>
            `,
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
        const info = await transporter.sendMail({
            from: '"QCMECHELLE11" <' + (process.env.EMAIL_FROM || process.env.EMAIL_USER) + '>',
            to: email,
            subject: "Paiement Approuvé - Bienvenue Premium !",
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Félicitations ${name} !</h2>
                    <p>Votre paiement pour le plan <strong>${planType}</strong> a été validé avec succès.</p>
                    <p>Vous avez désormais accès à tout le contenu Premium jusqu'au <strong>${new Date(expiresAt).toLocaleDateString()}</strong>.</p>
                    <br>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accéder à mon Dashboard</a>
                    <br><br>
                    <p>Bon courage pour vos révisions !</p>
                    <p>L'équipe QCMECHELLE11</p>
                </div>
            `,
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
        const info = await transporter.sendMail({
            from: '"QCMECHELLE11" <' + (process.env.EMAIL_FROM || process.env.EMAIL_USER) + '>',
            to: email,
            subject: "Nouvelle réponse à une discussion",
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h3>Nouvelle réponse !</h3>
                    <p><strong>${replierName}</strong> a répondu à une discussion que vous suivez.</p>
                    <br>
                    <a href="${link}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Voir la réponse</a>
                    <br><br>
                    <p>L'équipe QCMECHELLE11</p>
                </div>
            `,
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
        const info = await transporter.sendMail({
            from: '"QCMECHELLE11" <' + (process.env.EMAIL_FROM || process.env.EMAIL_USER) + '>',
            to: email,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    ${message}
                    <br><br>
                    <hr>
                    <p style="font-size: 12px; color: #777;">Vous recevez cet email car vous êtes inscrit sur QC App.</p>
                </div>
            `,
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
        const info = await transporter.sendMail({
            from: '"QCMECHELLE11 System" <' + (process.env.EMAIL_FROM || process.env.EMAIL_USER) + '>',
            to: adminEmail,
            subject: "Nouveau reçu de paiement téléchargé",
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h3>Nouveau paiement en attente !</h3>
                    <p>L'étudiant <strong>${studentName}</strong> a téléchargé un reçu pour le plan <strong>${planType}</strong>.</p>
                    <br>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Voir les paiements</a>
                    <br><br>
                    <p>Système QCMECHELLE11</p>
                </div>
            `,
        });
        console.log("Receipt notification email sent to admin: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending receipt notification email:", error);
        return null;
    }
};
