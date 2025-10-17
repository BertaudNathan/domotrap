# Étape 1 : image de base légère
FROM python:3.12-slim

# Étape 2 : installer sqlite3 CLI
RUN apt-get update && apt-get install -y sqlite3 && rm -rf /var/lib/apt/lists/*

# Étape 3 : définir le dossier de travail
WORKDIR /app

# Étape 4 : copier la base et le requirements
COPY data/BABYFOOT.db /app/data/BABYFOOT.db
COPY requirements.txt /app/requirements.txt

# Étape 5 : installer les dépendances Python
RUN pip install --no-cache-dir -r /app/requirements.txt

# Étape 6 : exposer un port (facultatif)
EXPOSE 8000

# Étape 7 : lancer un shell interactif
CMD ["bash"]
