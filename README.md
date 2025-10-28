# AI Traduttore

An intelligent AI-powered translator web application built with Next.js, React, and Tailwind CSS, leveraging the Gemini API for Italian-Spanish translations. This application aims to provide context-aware and intelligent translations, offering not just the main translation but also similar idioms and descriptions of the translated text.

## Features

- **Intelligent Translation:** Powered by Google Gemini 2.5 Flash model for high-quality, context-aware Italian-Spanish translations.
- **Idioms and Context:** Provides up to two similar idioms or common phrases and a brief description of the translated text's meaning or context.
- **Minimalist UI:** Clean, intuitive, and immediate user interface with a dark, Apple-style aesthetic.
- **Real-time Translation:** Instant translation as you type, with debouncing for efficient API usage.
- **Language Toggle:** Easy switching between Italian-to-Spanish and Spanish-to-Italian translation directions.

## Technologies Used

- **Next.js:** React framework for production.
- **React:** Frontend library for building user interfaces.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **TypeScript:** Strongly typed JavaScript.
- **Google Gemini API:** For AI-powered translation (using `gemini-2.5-flash`).
- **pnpm:** Fast, disk space efficient package manager.

## Setup and Installation

Follow these steps to get the project up and running on your local machine.

### Prerequisites

- Node.js (v18 or later)
- pnpm (install globally: `npm install -g pnpm`)

### 1. Clone the repository

```bash
git clone git@github.com:beltromatti/traduttore.git
cd traduttore/traduttore-app
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Gemini API Key

Create a `.env.local` file in the `traduttore-app` directory and add your Gemini API key:

```
NEXT_PUBLIC_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

Replace `YOUR_GEMINI_API_KEY` with the actual API key you obtained from Google AI Studio.

### 4. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment to Ubuntu Server

This section outlines the steps to deploy your Next.js application to an Ubuntu server for production.

### 1. Build the Application

```bash
pnpm build
```

### 2. Install Production Dependencies

On your Ubuntu server, navigate to your project directory and install production dependencies:

```bash
pnpm install --prod
```

### 3. Process Manager (PM2)

Use PM2 to keep your application running continuously.

```bash
npm install -g pm2
pm2 start pnpm --name "traduttore-ai" -- start
pm2 save
pm2 startup # Follow instructions to set up startup script
```

### 4. Reverse Proxy (Nginx)

Configure Nginx to serve your application, handle SSL, and manage traffic.

**Install Nginx:**
```bash
sudo apt update
sudo apt install nginx
```

**Configure Nginx (e.g., `/etc/nginx/sites-available/traduttore-ai`):**

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable and Restart Nginx:**
```bash
sudo ln -s /etc/nginx/sites-available/traduttore-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Set up HTTPS with Certbot:**
```bash
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d your_domain.com -d www.your_domain.com
```

### 5. Firewall (UFW)

```bash
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.