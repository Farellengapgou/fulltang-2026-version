# authentication/management/commands/seed_database.py
from django.core.management.base import BaseCommand
from authentication.models import MedicalStaff, ROLES, ROLES_ACCOUNTING
from faker import Faker
import random
fake = Faker()

# Liste de prénoms masculins et féminins
MALE_FIRST_NAMES = ["Jean", "Pierre", "Paul", "Jacques", "Michel", "Louis", "Alain", "Daniel", "André", "François"]
FEMALE_FIRST_NAMES = ["Marie", "Jeanne", "Anne", "Sophie", "Isabelle", "Nathalie", "Catherine", "Valérie", "Christine", "Françoise"]

class Command(BaseCommand):
    help = 'Remplit la base de données avec deux utilisateurs pour chaque type (MedicalStaff et AccountingStaff) et pour chaque rôle.'

    def handle(self, *args, **kwargs):
        # Créer des utilisateurs pour chaque rôle dans MedicalStaff
        for role_code, role_name in ROLES:
            if role_code != 'NoRole':  # Ignorer le rôle 'NoRole'
                for i in range(1, 3):  # Créer deux utilisateurs par rôle
                    # Choisir un genre aléatoire
                    gender = random.choice(['Male', 'Female'])
                    first_name = random.choice(MALE_FIRST_NAMES if gender == 'Male' else FEMALE_FIRST_NAMES)
                    last_name = fake.last_name()
                    username = f'{first_name.lower()}.{last_name.lower()}'
                    email = f'{username}@example.com'
                    password = 'password123'
                    cniNumber = fake.unique.bothify(text='##########')  # Générer un numéro CNI unique
                    phoneNumber = fake.phone_number()
                    birthDate = fake.date_of_birth(minimum_age=25, maximum_age=65)
                    address = fake.address().replace('\n', ', ')

                    user = MedicalStaff.objects.create(
                        username=username,
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        password=password,
                        gender=gender,
                        cniNumber=cniNumber,
                        phoneNumber=phoneNumber,
                        birthDate=birthDate,
                        address=address,
                        userType='Medical',
                        role=role_code,
                    )
                    self.stdout.write(self.style.SUCCESS(f'Créé MedicalStaff: {user.username} ({user.role})'))

        # Créer des utilisateurs pour chaque rôle dans AccountingStaff
        for role_code, role_name in ROLES_ACCOUNTING:
            if role_code != 'NoRole':  # Ignorer le rôle 'NoRole'
                for i in range(1, 3):  # Créer deux utilisateurs par rôle
                    # Choisir un genre aléatoire
                    gender = random.choice(['Male', 'Female'])
                    first_name = random.choice(MALE_FIRST_NAMES if gender == 'Male' else FEMALE_FIRST_NAMES)
                    last_name = fake.last_name()
                    username = f'{first_name.lower()}.{last_name.lower()}'
                    email = f'{username}@example.com'
                    password = 'password123'
                    cniNumber = fake.unique.bothify(text='##########')  # Générer un numéro CNI unique
                    phoneNumber = fake.phone_number()
                    birthDate = fake.date_of_birth(minimum_age=25, maximum_age=65)
                    address = fake.address().replace('\n', ', ')

                    user = MedicalStaff.objects.create(
                        username=username,
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        password=password,
                        gender=gender,
                        cniNumber=cniNumber,
                        phoneNumber=phoneNumber,
                        birthDate=birthDate,
                        address=address,
                        userType='Accountant',
                        role=role_code,
                    )
                    self.stdout.write(self.style.SUCCESS(f'Créé AccountingStaff: {user.username} ({user.role})'))

        self.stdout.write(self.style.SUCCESS('Base de données remplie avec succès !'))