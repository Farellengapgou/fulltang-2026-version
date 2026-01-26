

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('polyclinic', '0006_alter_exam_examdescription'),
    ]

    operations = [
        migrations.AlterField(
            model_name='polyclinicproduct',
            name='status',
            field=models.CharField(choices=[('Available', 'Available'), ('Running low', 'Running Low'), ('Discontinued', 'Discontinued'), ('Expiring Soon', 'Expiring Soon')], default='Available', max_length=20),
        ),
    ]
