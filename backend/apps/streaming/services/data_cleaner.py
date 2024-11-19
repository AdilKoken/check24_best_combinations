from decimal import Decimal
from datetime import datetime
from typing import Dict, Any, Optional, Union
import re

class DataCleaner:
    @staticmethod
    def clean_price(value: Any) -> Optional[int]:
        """
        Convert price to cents, handling various formats including European number format.
        Uses Decimal for precise calculations.
        Examples:
            "1000" -> 100000 (1000 euros to cents)
            "10.50" or "10,50" -> 1050 (10.50 euros to cents)
            "€10.99" -> 1099 (10.99 euros to cents)
            "1.000,00" -> 100000 (European format: 1000.00 euros to cents)
            "1,000.00" -> 100000 (US format: 1000.00 euros to cents)
            "10,99 EUR" -> 1099 (10.99 euros to cents)
        """
        if value == 0:
            return 0
        
        if not value:
            return None

        try:
            # Handle numeric input
            if isinstance(value, (int, float)):
                return int(Decimal(str(value)) * 100)

            # Convert string to number
            if isinstance(value, str):
                # Remove currency symbols, currency names, and whitespace
                value = value.strip()
                value = re.sub(r'[€$]', '', value)
                value = re.sub(r'\s*EUR\s*$', '', value, flags=re.IGNORECASE)
                value = value.strip()
                
                # Handle European number format (1.234.567,89)
                if '.' in value and ',' in value:
                    if value.index('.') < value.index(','):
                        # European format: remove dots and replace comma with dot
                        value = value.replace('.', '').replace(',', '.')
                    else:
                        # US format: remove commas
                        value = value.replace(',', '')
                else:
                    # Single separator: replace comma with dot
                    value = value.replace(',', '.')

                # Convert to Decimal for precise calculation
                return int(Decimal(value) * 100)

        except (ValueError, TypeError, ArithmeticError):
            return None
        
    @staticmethod
    def clean_string(value: Optional[str]) -> Optional[str]:
        """Clean and normalize string values"""
        if not value:
            return value
        # Remove extra whitespace and normalize
        value = ' '.join(value.split())
        # Remove any special characters except basic punctuation
        value = re.sub(r'[^\w\s\-.,()]', '', value)
        return value.strip()

    @staticmethod
    def clean_date(value: Optional[str]) -> Optional[str]:
        """Normalize date format"""
        if not value:
            return None
        try:
            # Try different date formats
            for fmt in ['%Y-%m-%d %H:%M:%S', '%Y-%m-%d %H:%M', '%d.%m.%Y %H:%M']:
                try:
                    date_obj = datetime.strptime(value, fmt)
                    return date_obj.strftime('%Y-%m-%d %H:%M:%S')
                except ValueError:
                    continue
            return None
        except Exception:
            return None

    @staticmethod
    def clean_boolean(value: Any) -> bool:
        """Normalize boolean values"""
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.lower() in ['1', 'true', 'yes', 'y', 't']
        if isinstance(value, (int, float)):
            return bool(value)
        return False

    @staticmethod
    def clean_game_data(row: Dict) -> Dict:
        """Clean game data"""
        return {
            'id': int(row['id']),
            'team_home': DataCleaner.clean_string(row['team_home']),
            'team_away': DataCleaner.clean_string(row['team_away']),
            'starts_at': DataCleaner.clean_date(row['starts_at']),
            'tournament_name': DataCleaner.clean_string(row['tournament_name'])
        }

    @staticmethod
    def clean_package_data(row: Dict) -> Dict:
        """Clean package data"""
        return {
            'id': int(row['id']),
            'name': DataCleaner.clean_string(row['name']),
            'monthly_price_cents': DataCleaner.clean_price(row.get('monthly_price_cents')),
            'monthly_price_yearly_subscription_in_cents': 
                DataCleaner.clean_price(row.get('monthly_price_yearly_subscription_in_cents'))
        }

    @staticmethod
    def clean_offer_data(row: Dict) -> Dict:
        """Clean offer data"""
        return {
            'game_id': int(row['game_id']),
            'streaming_package_id': int(row['streaming_package_id']),
            'live': DataCleaner.clean_boolean(row['live']),
            'highlights': DataCleaner.clean_boolean(row['highlights'])
        }