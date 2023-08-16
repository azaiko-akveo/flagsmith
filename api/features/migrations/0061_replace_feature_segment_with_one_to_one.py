# Generated by Django 3.2.20 on 2023-08-15 14:04

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("features", "0060_remove_redundant_segment_override_feature_states"),
    ]

    operations = [
        migrations.AlterField(
            model_name="featurestate",
            name="feature_segment",
            field=models.OneToOneField(
                blank=True,
                default=None,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="feature_state",
                to="features.featuresegment",
            ),
        ),
    ]
