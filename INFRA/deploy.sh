#!/usr/bin/env bash
set -euo pipefail
if [[ $EUID -ne 0 ]]; then echo "Veuillez exécuter avec sudo: sudo ./deploy.sh"; exit 1; fi

echo "🚀 Déploiement Babyfoot (Ansible + Docker)…"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ansible git python3-pip curl ca-certificates gnupg lsb-release

ansible-galaxy collection install -r requirements.yml
ansible-playbook -i inventory/hosts.ini site.yml

echo "✅ Terminé. Ouvrez http://localhost"
