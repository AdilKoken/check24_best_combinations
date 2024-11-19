from django.test import TestCase
from apps.streaming.services.data_cleaner import DataCleaner
from apps.streaming.services import DataValidator

class DataCleanerTests(TestCase):
    def test_clean_string(self):
        test_cases = [
            ('Bayern  München', 'Bayern München'),
            ('FC Barcelona!!@#', 'FC Barcelona'),
            ('   Real   Madrid   ', 'Real Madrid'),
            ('', ''),
            (None, None),
        ]
        for input_val, expected in test_cases:
            self.assertEqual(
                DataCleaner.clean_string(input_val), 
                expected,
                f"Failed for input '{input_val}'"
            )

    def test_clean_price(self):
        """Test price cleaning with various formats including currency indicators"""
        test_cases = [
            # Basic cases
            ('10', 1000),           # 10 -> 1000 cents
            ('10.50', 1050),        # 10.50 -> 1050 cents
            ('10,50', 1050),        # 10,50 -> 1050 cents
            
            # European format
            ('1.000,00', 100000),   # 1.000,00 -> 100000 cents
            ('1.000,50', 100050),   # 1.000,50 -> 100050 cents
            ('1.234.567,89', 123456789), # 1.234.567,89 -> 123456789 cents
            
            # US/UK format
            ('1,000.00', 100000),   # 1,000.00 -> 100000 cents
            ('1,234,567.89', 123456789), # 1,234,567.89 -> 123456789 cents
            
            # Currency symbols and text
            ('€10.99', 1099),       # €10.99 -> 1099 cents
            ('€ 1.000,00', 100000), # € 1.000,00 -> 100000 cents
            ('$ 1,000.00', 100000), # $ 1,000.00 -> 100000 cents
            
            # Numbers without currency
            (10, 1000),             # 10 -> 1000 cents
            (10.50, 1050),          # 10.50 -> 1050 cents
            (1000, 100000),         # 1000 -> 100000 cents
            (1000.00, 100000),      # 1000.00 -> 100000 cents
            
            # Zero values
            ('0', 0),
            ('0,00', 0),
            ('0.00', 0),
            ('€0', 0),
            (0, 0),
            
            # Edge cases
            ('', None),
            (None, None),
            ('invalid', None),
            ('€€€', None),
            ('EUR', None),
            ('just text', None),
        ]
        
        for input_val, expected in test_cases:
            result = DataCleaner.clean_price(input_val)
            self.assertEqual(
                result, 
                expected, 
                f"Failed for input '{input_val}': expected {expected}, got {result}"
            )

    def test_clean_date(self):
        test_cases = [
            ('2024-06-14 19:00:00', '2024-06-14 19:00:00'),
            ('2024-06-14 19:00', '2024-06-14 19:00:00'),
            ('14.06.2024 19:00', '2024-06-14 19:00:00'),
            ('invalid date', None),
            ('', None),
        ]
        for input_val, expected in test_cases:
            self.assertEqual(DataCleaner.clean_date(input_val), expected)

    def test_clean_boolean(self):
        test_cases = [
            # String inputs
            ('1', True),
            ('0', False),
            ('true', True),
            ('false', False),
            ('yes', True),
            ('no', False),
            ('y', True),
            ('n', False),
            # Boolean inputs
            (True, True),
            (False, False),
            # Number inputs
            (1, True),
            (0, False),
            # Edge cases
            ('', False),
            (None, False),
        ]
        for input_val, expected in test_cases:
            result = DataCleaner.clean_boolean(input_val)
            self.assertEqual(
                result, 
                expected, 
                f"Failed for input '{input_val}': expected {expected}, got {result}"
            )