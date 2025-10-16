#!/usr/bin/env bash
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Veuillez exécuter avec sudo: sudo ./deploy.sh"
  exit 1
fi

echo "🚀 Déploiement du Babyfoot connecté sur cette machine..."

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y git python3-pip ufw
pipninstall --upgrade ansible

ansible-galaxy collection install -r requirements.yml

ansible-playbook -i inventory/hosts.ini site.yml

echo "✅ Déploiement terminé avec succès !"
echo "Testez : curl http://localhost"

