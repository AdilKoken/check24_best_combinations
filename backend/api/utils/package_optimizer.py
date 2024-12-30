from typing import List, Dict, Set, Tuple
from django.db.models import Q
from api.models import Game, StreamingOffer

def get_team_games(teams: List[str]) -> Set[int]:
    """Get all game IDs for the given teams"""
    return set(Game.objects.filter(
        Q(team_home__in=teams) | Q(team_away__in=teams)
    ).values_list('id', flat=True))

def calculate_package_coverage(packages, team_games_ids):
    """Calculate the coverage of each package"""
    package_coverage = []
    total_game_count = len(team_games_ids)
    
    for package in packages:
        # Get games covered by this package
        covered_games = StreamingOffer.objects.filter(
            game_id__in=team_games_ids,
            streaming_package_id=package.id
        ).count()
        
        coverage = covered_games / total_game_count if total_game_count > 0 else 0
        package_coverage.append({
            'package': package,
            'coverage': coverage
        })
    
    return package_coverage