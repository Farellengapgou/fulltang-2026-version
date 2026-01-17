# Utiliser une image de base officielle de Python
FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    libmariadb-dev \
    pkg-config \
    build-essential \
    default-libmysqlclient-dev

COPY requirements.txt /app

RUN pip install --no-cache-dir -r requirements.txt && \
    adduser \
        --disabled-password \
        --no-create-home \
        django-user

COPY . /app

# Create db.sqlite3 if it doesn't exist, then set permissions
RUN touch db.sqlite3 && \
    chmod 666 db.sqlite3 && \
    chmod -R 777 /app


# Exposer le port sur lequel l'application va fonctionner
EXPOSE 8009


# Définir la variable d'environnement pour désactiver le buffering des sorties (optionnel)
ENV PYTHONUNBUFFERED=1

# Lancer les migrations et démarrer le serveur Django
CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0.0.0.0:8009"]