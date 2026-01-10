# Image Python
FROM python:3.10-slim

# Répertoire de travail
WORKDIR /app

# Installer dépendances système
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    libmariadb-dev-compat \
    libmariadb-dev \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    curl \
 && rm -rf /var/lib/apt/lists/*

# Copier requirements 
COPY requirements.txt .

# Upgrade pip + installer dépendances Python
RUN pip install --upgrade pip && \
    pip install --default-timeout=200 --no-cache-dir -r requirements.txt

# Créer utilisateur Django
RUN adduser --disabled-password --gecos "" --no-create-home django-user

# Copier le code
COPY . /app

# Permissions et création DB
RUN chmod -R 777 /app && \
    touch db.sqlite3 && \
    chmod 666 db.sqlite3

# Port exposé
EXPOSE 8009

# Désactiver output buffering
ENV PYTHONUNBUFFERED=1

# Lancer les migrations et démarrer le serveur Django
CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0.0.0.0:8009"]
