from django.apps import AppConfig


class PolyclinicConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'polyclinic'

    def ready(self):
        import polyclinic.signals
        import polyclinic.accounting_signals  # Register accounting integration signals
