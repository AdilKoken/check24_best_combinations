from datetime import datetime
from typing import Dict, List, Tuple
import csv
import os

class DataValidator:
    @staticmethod
    def validate_game_row(row: Dict) -> Tuple[bool, List[str]]:
        errors = []
        required_fields = ['id', 'team_home', 'team_away', 'starts_at', 'tournament_name']
        
        # Check required fields
        for field in required_fields:
            if field not in row or not row[field]:
                errors.append(f'Missing required field: {field}')
        
        # Validate ID
        if 'id' in row:
            try:
                int(row['id'])
            except ValueError:
                errors.append('Invalid ID format')

        # Validate date format
        if 'starts_at' in row and row['starts_at']:
            try:
                datetime.strptime(row['starts_at'], '%Y-%m-%d %H:%M:%S')
            except ValueError:
                errors.append('Invalid date format. Expected: YYYY-MM-DD HH:MM:SS')

        return len(errors) == 0, errors

    @staticmethod
    def validate_package_row(row: Dict) -> Tuple[bool, List[str]]:
        errors = []
        required_fields = ['id', 'name']
        
        # Check required fields
        for field in required_fields:
            if field not in row or not row[field]:
                errors.append(f'Missing required field: {field}')

        # Validate prices if present
        price_fields = ['monthly_price_cents', 'monthly_price_yearly_subscription_in_cents']
        for field in price_fields:
            if field in row and row[field]:
                try:
                    int(row[field])
                except ValueError:
                    errors.append(f'Invalid price format for {field}')

        return len(errors) == 0, errors

    @staticmethod
    def validate_offer_row(row: Dict) -> Tuple[bool, List[str]]:
        errors = []
        required_fields = ['game_id', 'streaming_package_id', 'live', 'highlights']
        
        # Check required fields
        for field in required_fields:
            if field not in row or row[field] == '':
                errors.append(f'Missing required field: {field}')

        # Validate IDs
        id_fields = ['game_id', 'streaming_package_id']
        for field in id_fields:
            if field in row:
                try:
                    int(row[field])
                except ValueError:
                    errors.append(f'Invalid {field} format')

        # Validate boolean fields
        bool_fields = ['live', 'highlights']
        for field in bool_fields:
            if field in row:
                if row[field] not in ['0', '1']:
                    errors.append(f'Invalid {field} value. Must be 0 or 1')

        return len(errors) == 0, errors

    @staticmethod
    def validate_csv_file(file_path: str, validator_func) -> Tuple[bool, List[str]]:
        all_errors = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for i, row in enumerate(reader, start=2):  # Start from 2 to account for header row
                    is_valid, errors = validator_func(row)
                    if not is_valid:
                        all_errors.extend([f'Row {i}: {error}' for error in errors])
                        
        except Exception as e:
            all_errors.append(f'Error reading file: {str(e)}')
            
        return len(all_errors) == 0, all_errors