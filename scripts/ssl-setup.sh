#!/bin/bash
set -e

echo "Setting up Let's Encrypt SSL certificates for StartupIQ AI..."

# Ensure we're running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root"
  exit
fi

# Install Certbot and Nginx plugin
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Obtain certificates
certbot --nginx \
  -d startupiq.in \
  -d www.startupiq.in \
  --non-interactive \
  --agree-tos \
  -m admin@startupiq.in \
  --redirect

# Setup auto-renewal cron job if it doesn't exist
CRON_JOB="0 12 * * * /usr/bin/certbot renew --quiet"
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "$CRON_JOB") | crontab -

echo "SSL setup complete! Auto-renewal configured."
