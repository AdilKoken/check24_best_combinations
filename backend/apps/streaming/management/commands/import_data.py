import csv
import logging
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.streaming.models import Game, StreamingPackage, StreamingOffer
from apps.streaming.services import DataValidator
from apps.streaming.services.data_cleaner import DataCleaner

import os

logger = logging.getLogger('streaming')

class Command(BaseCommand):
    help = 'Import data from CSV files'

    def validate_files(self):
        data_dir = os.path.join('data')
        files_to_validate = [
            ('games.csv', DataValidator.validate_game_row),
            ('packages.csv', DataValidator.validate_package_row),
            ('offers.csv', DataValidator.validate_offer_row)
        ]
        
        all_valid = True
        for file_name, validator in files_to_validate:
            file_path = os.path.join(data_dir, file_name)
            is_valid, errors = DataValidator.validate_csv_file(file_path, validator)
            
            if not is_valid:
                all_valid = False
                self.stdout.write(self.style.ERROR(f'\nValidation errors in {file_name}:'))
                for error in errors:
                    self.stdout.write(self.style.ERROR(f'  - {error}'))
                    logger.error(f'Validation error in {file_name}: {error}')
        
        return all_valid

    def handle(self, *args, **kwargs):
        logger.info('Starting data import process')
        
        # Validate files first
        self.stdout.write('Validating CSV files...')
        if not self.validate_files():
            self.stdout.write(self.style.ERROR('Validation failed. Import aborted.'))
            return

        data_dir = os.path.join('data')
        
        try:
            with transaction.atomic():
                # Clear existing data
                self.stdout.write('Clearing existing data...')
                StreamingOffer.objects.all().delete()
                Game.objects.all().delete()
                StreamingPackage.objects.all().delete()

                # Import packages
                self.stdout.write('Importing packages...')
                with open(os.path.join(data_dir, 'packages.csv'), 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    packages = []
                    for row in reader:
                        cleaned_data = DataCleaner.clean_package_data(row)
                        packages.append(StreamingPackage(**cleaned_data))
                    StreamingPackage.objects.bulk_create(packages)
                self.stdout.write(self.style.SUCCESS(f'Imported {len(packages)} packages'))

                # Import games
                self.stdout.write('Importing games...')
                with open(os.path.join(data_dir, 'games.csv'), 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    games = []
                    for row in reader:
                        cleaned_data = DataCleaner.clean_game_data(row)
                        games.append(Game(**cleaned_data))
                    Game.objects.bulk_create(games)
                self.stdout.write(self.style.SUCCESS(f'Imported {len(games)} games'))

                # Import offers
                self.stdout.write('Importing offers...')
                with open(os.path.join(data_dir, 'offers.csv'), 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    offers = []
                    for row in reader:
                        cleaned_data = DataCleaner.clean_offer_data(row)
                        offers.append(StreamingOffer(**cleaned_data))
                    StreamingOffer.objects.bulk_create(offers)
                self.stdout.write(self.style.SUCCESS(f'Imported {len(offers)} offers'))

                logger.info('Data import completed successfully')
                self.stdout.write(self.style.SUCCESS('Data import completed successfully'))
                
        except Exception as e:
            logger.error(f'Error during import: {str(e)}')
            self.stdout.write(self.style.ERROR(f'Error during import: {str(e)}'))
            raise e