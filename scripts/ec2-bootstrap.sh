#!/bin/bash
set -e

echo "Bootstrapping VentureForge EC2 Instance (Ubuntu 22.04)..."

# Ensure we're running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root"
  exit
fi

# Update packages
apt-get update && apt-get upgrade -y

# Install prerequisites
apt-get install -y ca-certificates curl gnupg unzip ufw

# Install Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable and start Docker
systemctl enable docker
systemctl start docker

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip

# Create config directory for .env
mkdir -p /etc/ventureforge
chmod 700 /etc/ventureforge
chown ubuntu:ubuntu /etc/ventureforge

# Configure UFW Firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "EC2 Bootstrap Complete! Next steps:"
echo "1. Run 'aws configure' as ubuntu user."
echo "2. Place your production .env file in /etc/ventureforge/.env"
echo "3. Run deployment scripts."
