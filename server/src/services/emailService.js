import nodemailer from 'nodemailer';

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendConfirmationEmail = async (email, name) => {
    try {
        const info = await transporter.sendMail({
            from: '"QC App" <' + process.env.EMAIL_USER + '>', // sender address
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
                    <p>L'équipe QC App</p>
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
            from: '"QC App" <' + process.env.EMAIL_USER + '>',
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
                    <p>L'équipe QC App</p>
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
