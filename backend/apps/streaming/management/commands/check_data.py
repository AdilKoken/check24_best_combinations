import os
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Check if all required CSV files are present and readable'

    def handle(self, *args, **kwargs):
        data_dir = os.path.join('data')
        required_files = ['games.csv', 'packages.csv', 'offers.csv']
        
        # Check if data directory exists
        if not os.path.exists(data_dir):
            self.stdout.write(self.style.ERROR(f'Data directory not found at: {data_dir}'))
            self.stdout.write('Please create the directory and add your CSV files')
            return

        # Check each required file
        all_present = True
        for file_name in required_files:
            file_path = os.path.join(data_dir, file_name)
            if not os.path.exists(file_path):
                self.stdout.write(self.style.ERROR(f'Missing file: {file_name}'))
                all_present = False
            else:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        first_line = f.readline()
                        self.stdout.write(self.style.SUCCESS(f'Found and verified {file_name}'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error reading {file_name}: {str(e)}'))
                    all_present = False

        if all_present:
            self.stdout.write(self.style.SUCCESS('All required files are present and readable'))
        else:
            self.stdout.write(self.style.ERROR('Some files are missing or unreadable'))