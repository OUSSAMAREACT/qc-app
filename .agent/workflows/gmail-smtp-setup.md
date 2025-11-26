---
description: How to generate a Google App Password for SMTP
---

# How to Generate a Google App Password

To use Gmail as an SMTP server (for sending emails from your app), you cannot use your regular password. You must generate an **App Password**.

## Prerequisites
- You must have **2-Step Verification** enabled on your Google Account.

## Steps

1.  **Go to your Google Account**:
    - Visit [myaccount.google.com](https://myaccount.google.com/).
    - Click on **Security** in the left sidebar.

2.  **Enable 2-Step Verification** (if not already enabled):
    - Under "How you sign in to Google", look for **2-Step Verification**.
    - If it is "Off", click it and follow the steps to turn it on.

3.  **Generate App Password**:
    - Once 2-Step Verification is ON, search for **"App passwords"** in the search bar at the top of the page (or look under "2-Step Verification" settings, sometimes it's at the bottom of that page).
    - If you can't find it, use this direct link: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
    - You may be asked to sign in again.

4.  **Create the Password**:
    - **App name**: Type a name like "QC App" or "Coolify".
    - Click **Create**.

5.  **Copy the Password**:
    - A 16-character code will appear (e.g., `abcd efgh ijkl mnop`).
    - **Copy this code**. This is your `EMAIL_PASS`.
    - You don't need the spaces when you use it, but keeping them usually works too.

## Usage in Coolify
- **EMAIL_HOST**: `smtp.gmail.com`
- **EMAIL_PORT**: `587`
- **EMAIL_USER**: `your.email@gmail.com`
- **EMAIL_PASS**: `paste_the_16_char_code_here`
