import pandas as pd
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def validate_csv_files():
    """
    Validate CSV files before importing data
    Returns: bool, list of error messages
    """
    errors = []
    
    try:
        # Validate games.csv
        games_df = pd.read_csv(settings.GAMES_CSV)
        required_columns = ['id', 'team_home', 'team_away', 'starts_at', 'tournament_name']
        for col in required_columns:
            if col not in games_df.columns:
                errors.append(f"Missing column {col} in games.csv")
        
        # Validate packages.csv
        packages_df = pd.read_csv(settings.PACKAGES_CSV)
        required_columns = ['id', 'name', 'monthly_price_cents', 
                          'monthly_price_yearly_subscription_in_cents']
        for col in required_columns:
            if col not in packages_df.columns:
                errors.append(f"Missing column {col} in packages.csv")
        
        # Validate offers.csv
        offers_df = pd.read_csv(settings.OFFERS_CSV)
        required_columns = ['game_id', 'streaming_package_id', 'live', 'highlights']
        for col in required_columns:
            if col not in offers_df.columns:
                errors.append(f"Missing column {col} in offers.csv")
        
        # Validate relationships
        game_ids = set(games_df['id'].unique())
        package_ids = set(packages_df['id'].unique())
        
        # Check if all game_ids in offers exist in games
        offer_game_ids = set(offers_df['game_id'].unique())
        invalid_game_ids = offer_game_ids - game_ids
        if invalid_game_ids:
            errors.append(f"Found invalid game_ids in offers.csv: {invalid_game_ids}")
        
        # Check if all package_ids in offers exist in packages
        offer_package_ids = set(offers_df['streaming_package_id'].unique())
        invalid_package_ids = offer_package_ids - package_ids
        if invalid_package_ids:
            errors.append(f"Found invalid package_ids in offers.csv: {invalid_package_ids}")
        
    except Exception as e:
        errors.append(f"Error validating CSV files: {str(e)}")
        logger.error(f"CSV validation error: {str(e)}")
        return False, errors
    
    if errors:
        for error in errors:
            logger.error(f"Data validation error: {error}")
        return False, errors
    
    return True, []