import pandas as pd
import pytz
from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import transaction
from api.models import Game, StreamingPackage, StreamingOffer

class Command(BaseCommand):
    help = 'Import data from CSV files'

    def handle(self, *args, **options):
        self.stdout.write('Starting data import...')

        try:
            # Wipe existing data in a single transaction
            with transaction.atomic():
                StreamingOffer.objects.all().delete()
                Game.objects.all().delete()
                StreamingPackage.objects.all().delete()

            with transaction.atomic():
                # ================================
                # 1. IMPORT GAMES
                # ================================
                self.stdout.write('Importing games...')
                games_df = pd.read_csv(settings.GAMES_CSV)
                # Convert starts_at to UTC-aware
                games_df['starts_at'] = pd.to_datetime(games_df['starts_at'], utc=True)

                games = [
                    Game(
                        id=row['id'],
                        team_home=row['team_home'],
                        team_away=row['team_away'],
                        starts_at=row['starts_at'],    # tz-aware now!
                        tournament_name=row['tournament_name']
                    )
                    for _, row in games_df.iterrows()
                ]
                Game.objects.bulk_create(games)
                self.stdout.write(self.style.SUCCESS(f'Successfully imported {len(games)} games'))

                # ================================
                # 2. IMPORT PACKAGES
                # ================================
                self.stdout.write('Importing packages...')
                packages_df = pd.read_csv(settings.PACKAGES_CSV)
                packages_df['monthly_price_cents'] = packages_df['monthly_price_cents'].fillna(0)
                packages_df['monthly_price_yearly_subscription_in_cents'] = (
                    packages_df['monthly_price_yearly_subscription_in_cents'].fillna(0)
                )

                packages = [
                    StreamingPackage(
                        id=row['id'],
                        name=row['name'],
                        monthly_price_cents=int(row['monthly_price_cents']),
                        monthly_price_yearly_subscription_in_cents=int(
                            row['monthly_price_yearly_subscription_in_cents']
                        )
                    )
                    for _, row in packages_df.iterrows()
                ]
                StreamingPackage.objects.bulk_create(packages)
                self.stdout.write(self.style.SUCCESS(f'Successfully imported {len(packages)} packages'))

                # ================================
                # 3. IMPORT OFFERS
                # ================================
                self.stdout.write('Importing offers...')
                offers_df = pd.read_csv(settings.OFFERS_CSV)
                offers = [
                    StreamingOffer(
                        game_id=row['game_id'],
                        streaming_package_id=row['streaming_package_id'],
                        live=bool(row['live']),
                        highlights=bool(row['highlights'])
                    )
                    for _, row in offers_df.iterrows()
                ]
                StreamingOffer.objects.bulk_create(offers)
                self.stdout.write(self.style.SUCCESS(f'Successfully imported {len(offers)} offers'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error during import: {str(e)}'))
            raise

        self.stdout.write(self.style.SUCCESS('Data import completed successfully'))
