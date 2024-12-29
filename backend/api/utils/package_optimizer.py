from typing import List, Dict, Set, Tuple
from django.db.models import Q
from api.models import Game, StreamingPackage, StreamingOffer

def get_team_games(teams: List[str]) -> Set[int]:
    """Get all game IDs for the given teams"""
    return set(Game.objects.filter(
        Q(team_home__in=teams) | Q(team_away__in=teams)
    ).values_list('id', flat=True))

def calculate_package_coverage(
    package: StreamingPackage,
    game_ids: Set[int]
) -> Dict[str, int]:
    """Calculate coverage metrics for a single package"""
    if not game_ids:
        return {
            'total_matches': 0,
            'live_matches': 0,
            'highlights_only': 0,
            'coverage_percentage': 0
        }

    offers = StreamingOffer.objects.filter(
        streaming_package=package,
        game_id__in=game_ids
    )

    live_matches = offers.filter(live=True).count()
    highlights_only = offers.filter(live=False, highlights=True).count()
    total_matches = live_matches + highlights_only
    
    return {
        'total_matches': total_matches,
        'live_matches': live_matches,
        'highlights_only': highlights_only,
        'coverage_percentage': round((total_matches / len(game_ids)) * 100, 2)
    }

def find_optimal_combinations(
    teams: List[str],
    max_combinations: int = 5
) -> List[Dict]:
    """Find optimal package combinations for maximum coverage"""
    game_ids = get_team_games(teams)
    if not game_ids:
        return []

    packages = list(StreamingPackage.objects.all())
    total_games = len(game_ids)
    
    # Start with single package coverage
    combinations = [{
        'packages': [pkg],
        'covered_games': set(
            StreamingOffer.objects.filter(
                streaming_package=pkg,
                game_id__in=game_ids
            ).values_list('game_id', flat=True)
        )
    } for pkg in packages]
    
    # Try combinations of packages
    best_combinations = []
    for size in range(1, 4):  # Limit to combinations of 3 packages
        for combo in combinations:
            if len(combo['packages']) != size:
                continue
                
            coverage = len(combo['covered_games'])
            monthly_cost = sum(p.monthly_price_cents for p in combo['packages'])
            yearly_cost = sum(p.monthly_price_yearly_subscription_in_cents * 12 for p in combo['packages'])
            
            best_combinations.append({
                'packages': combo['packages'],
                'total_monthly_cost': monthly_cost / 100,
                'total_yearly_cost': yearly_cost / 100,
                'coverage': {
                    'total_matches': coverage,
                    'live_matches': len([g for g in combo['covered_games'] if 
                        any(o.live for o in StreamingOffer.objects.filter(
                            game_id=g,
                            streaming_package__in=combo['packages']
                        ))
                    ]),
                    'highlights_only': len([g for g in combo['covered_games'] if 
                        not any(o.live for o in StreamingOffer.objects.filter(
                            game_id=g,
                            streaming_package__in=combo['packages']
                        ))
                    ]),
                    'coverage_percentage': round((coverage / total_games) * 100, 2)
                }
            })
            
            # If we haven't reached full coverage, try adding another package
            if coverage < total_games and size < 3:
                for pkg in packages:
                    if pkg not in combo['packages']:
                        additional_games = set(
                            StreamingOffer.objects.filter(
                                streaming_package=pkg,
                                game_id__in=game_ids
                            ).values_list('game_id', flat=True)
                        )
                        if additional_games - combo['covered_games']:  # Only add if it improves coverage
                            combinations.append({
                                'packages': combo['packages'] + [pkg],
                                'covered_games': combo['covered_games'] | additional_games
                            })

    # Sort by coverage percentage (desc) and cost (asc)
    best_combinations.sort(
        key=lambda x: (-x['coverage']['coverage_percentage'], x['total_yearly_cost'])
    )
    
    return best_combinations[:max_combinations]