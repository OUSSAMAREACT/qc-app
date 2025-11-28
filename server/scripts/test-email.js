import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath1 = path.join(__dirname, '../.env');
const envPath2 = path.join(process.cwd(), 'server/.env');
const envPath3 = path.join(process.cwd(), '.env');

let envPath = envPath1;
if (fs.existsSync(envPath1)) {
    envPath = envPath1;
} else if (fs.existsSync(envPath2)) {
    envPath = envPath2;
} else if (fs.existsSync(envPath3)) {
    envPath = envPath3;
}

console.log(`Loading .env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env file:", result.error);
}

console.log("--- Email Configuration Check ---");
console.log("HOST:", process.env.EMAIL_HOST);
console.log("PORT:", process.env.EMAIL_PORT);
console.log("USER:", process.env.EMAIL_USER);
console.log("PASS:", process.env.EMAIL_PASS ? "****" : "MISSING");
console.log("SECURE:", process.env.EMAIL_SECURE);
console.log("FROM:", process.env.EMAIL_FROM || process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_PORT === '465',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function test() {
    try {
        console.log("Verifying connection...");
        await transporter.verify();
        console.log("Connection successful!");

        const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
        // If using Resend, and EMAIL_USER is 'resend', we MUST have a valid FROM address
        if (process.env.EMAIL_USER === 'resend' && !process.env.EMAIL_FROM) {
            console.warn("WARNING: EMAIL_USER is 'resend' but EMAIL_FROM is not set. Sending might fail if 'resend' is not a valid sender address.");
        }

        console.log(`Sending test email from ${fromAddress}...`);
        const info = await transporter.sendMail({
            from: fromAddress,
            to: 'delivered@resend.dev', // Safe test address for Resend
            subject: "Test Email from QC App",
            text: "If you see this, email is working!",
        });
        console.log("Email sent: %s", info.messageId);
    } catch (error) {
        console.error("ERROR:", error);
    }
}

test();
