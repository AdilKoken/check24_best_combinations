from rest_framework import viewsets, views
from rest_framework.response import Response
from django.db.models import Q, Count, Prefetch
from typing import List, Dict, Set
from .models import Game, StreamingPackage, StreamingOffer
from .serializers import StreamingPackageSerializer
from itertools import combinations

from .utils.package_optimizer import calculate_package_coverage


class TeamListView(views.APIView):
 def get(self, request):
    """Get all unique team names"""
    home_teams = Game.objects.values_list('team_home', flat=True).distinct()
    away_teams = Game.objects.values_list('team_away', flat=True).distinct()
    all_teams = sorted(set(list(home_teams) + list(away_teams)))
    return Response(all_teams)
    
class PackageListView(views.APIView):
    def get(self, request):
        """Get all streaming packages"""
        packages = StreamingPackage.objects.all()
        serializer = StreamingPackageSerializer(packages, many=True)
        return Response(serializer.data)

class TeamSearchView(views.APIView):
    def get(self, request):
        """Search teams by name"""
        query = request.query_params.get('query', '').lower()
        if not query:
            return Response([])

        home_teams = Game.objects.filter(team_home__icontains=query)
        away_teams = Game.objects.filter(team_away__icontains=query)
        all_teams = sorted(set(
            list(home_teams.values_list('team_home', flat=True)) +
            list(away_teams.values_list('team_away', flat=True))
        ))
        return Response(all_teams)
    
class PackagesByTeamsView(views.APIView):
    http_method_names = ['post']
    
    def post(self, request, *args, **kwargs):
        """Get packages that offer all games for selected teams"""
        print(f"\n packages by teams view\n")
        print("Received request method:", request.method)
        print("Received content type:", request.content_type)
        print("Received data:", request.data)
        
        teams = request.data.get('teams', [])
        print("Extracted teams:", teams)
        
        if not teams:
            # No teams selected, return all packages
            packages = StreamingPackage.objects.all()
            serializer = StreamingPackageSerializer(packages, many=True)
            return Response(serializer.data)
        
        print("Extracted teams:", teams)

        # Get all games involving the selected teams
        team_games = Game.objects.filter(
            Q(team_home__in=teams) | Q(team_away__in=teams)
        )
            
        #Convert the games to a list of IDs
        team_games_ids = team_games.values_list('id', flat=True).distinct()
        team_games_count = len(team_games_ids)
        
        # Only fetch packages that cover all those games
        packages = (
            StreamingPackage.objects
            .annotate(
                covered_game_count=Count(
                    'streamingoffer__game',
                    filter=Q(streamingoffer__game__in=team_games_ids),
                    distinct=True
                )
            )
            .filter(covered_game_count=team_games_count)
        ).distinct()

        print("Found packages:", packages.count())
        
        serializer = StreamingPackageSerializer(packages, many=True)
        return Response(serializer.data)
    
class PackagesByTeamsViewSoft(views.APIView):
    http_method_names = ['post']

    def post(self, request, *args, **kwargs):
        """Get packages with coverage percentage for selected teams"""
        teams = request.data.get('teams', [])
        
        if not teams:
            packages = StreamingPackage.objects.all()
            serializer = StreamingPackageSerializer(packages, many=True)
            return Response(serializer.data)

        # Get all games involving the selected teams
        team_games = Game.objects.filter(
            Q(team_home__in=teams) | Q(team_away__in=teams)
        )
            
        # Convert the games to a list of IDs
        team_games_ids = team_games.values_list('id', flat=True).distinct()
        
        # Get all packages
        packages = StreamingPackage.objects.all()
        
        # Calculate coverage for each package
        package_coverage = calculate_package_coverage(packages, team_games_ids)

        # Convert to response format
        response_data = [
            {
                'package': StreamingPackageSerializer(item['package']).data,
                'coverage': item['coverage']
            }
            for item in package_coverage
        ]

        # Sort packages by coverage (highest first)
        response_data.sort(key=lambda x: x['coverage'], reverse=True)

        return Response(response_data)

class PackageCombinationView(views.APIView):
    http_method_names = ['post']
    
    def post(self, request, *args, **kwargs):
        """
        Step-by-step logic:

        1) Parse request data for `teams`, `packages_to_exclude`, and `max_size`.
        2) Get all games for the given teams.
        3) Get all streaming packages that cover at least one of these games.
           Exclude any packages the user wants to exclude.
        4) Separate free packages from paid packages.
        5) Collect coverage from all relevant free packages first. 
           If these free packages alone cover 100% of games, return only that combo.
        6) If free packages alone do not cover everything, generate combinations
           of the remaining (paid) packages up to `max_size`. Combine coverage
           from free + paid to see if we reach 100%. Keep all combos that cover 100%.
        7) Sort combos by total monthly price and return the response.
        """

        # 1) Parse request data
        teams = request.data.get('teams', [])
        packages_to_exclude = request.data.get('packages_to_exclude', []) or []
        max_size = request.data.get('max_size', 8)  # Default = 8
        try:
            max_size = int(max_size)
        except ValueError:
            max_size = 8

        # If no teams provided, nothing to do
        if not teams:
            return Response([])

        # 2) Get all games for these teams
        team_games = Game.objects.filter(
            Q(team_home__in=teams) | Q(team_away__in=teams)
        )
        team_games_ids = set(team_games.values_list('id', flat=True).distinct())

        # If no games for these teams, return empty
        if not team_games_ids:
            return Response([])

        # 3) Get all relevant packages covering at least one of these games with prefetching
        packages = StreamingPackage.objects.filter(
            streamingoffer__game__in=team_games_ids
        ).prefetch_related(
            Prefetch(
                'streamingoffer_set',
                queryset=StreamingOffer.objects.filter(game_id__in=team_games_ids),
                to_attr='relevant_offers'
            )
        ).distinct()

        # Exclude packages specified by the user
        if packages_to_exclude:
            packages = packages.exclude(id__in=packages_to_exclude)

        # 4) Separate free packages from paid packages with prefetching maintained
        all_free_packages = packages.filter(
            Q(monthly_price_cents__isnull=False) & Q(monthly_price_cents=0) 
        )
        paid_packages = packages.exclude(id__in=all_free_packages)

        # 5) Collect coverage from all relevant free packages
        coverage_from_free = set()
        free_packages_in_use = []
        games_to_cover = set(team_games_ids)

        for free_pkg in all_free_packages:
            # Use prefetched offers
            covered_by_this_free = {offer.game_id for offer in free_pkg.relevant_offers}
            if covered_by_this_free:
                games_to_cover -= covered_by_this_free
                free_packages_in_use.append(free_pkg)
                coverage_from_free |= covered_by_this_free

        # If free coverage alone covers everything, return only that combo
        if games_to_cover == set():
            return Response(
                self._build_response(
                    [free_packages_in_use]  # just one combo
                )
            )

        # 6) Generate combos of paid packages up to `max_size`
        all_covering_combos = []
        paid_package_list = list(paid_packages)

        max_combo_size = min(max_size, len(paid_package_list))

        for size in range(1, max_combo_size + 1):
            for combo in combinations(paid_package_list, size):
                games_to_cover_combo = set(games_to_cover)

                # Use prefetched offers for paid packages too
                for paid_pkg in combo:
                    coverage_of_paid_pkg = {offer.game_id for offer in paid_pkg.relevant_offers}
                    games_to_cover_combo -= coverage_of_paid_pkg

                if games_to_cover_combo:
                    continue

                if games_to_cover_combo == set():
                    final_combo = list(free_packages_in_use) + list(combo)
                    all_covering_combos.append(final_combo)

        # 7) Build, sort, and return the combos
        response_data = self._build_response(all_covering_combos)
        return Response(response_data)

    def _build_response(self, combinations: List[List[StreamingPackage]]) -> List[Dict]:
        """Build response data for each combo with improved sorting"""
        response = []
        for combo in combinations:
            total_monthly = sum(p.monthly_price_cents or 0 for p in combo)
            total_yearly_by_monthly = sum(p.monthly_price_yearly_subscription_in_cents for p in combo)
            
            response.append({
                'packages': StreamingPackageSerializer(combo, many=True).data,
                'total_monthly_price': total_monthly if any(p.monthly_price_cents for p in combo) else None,
                'total_yearly_by_monthly': total_yearly_by_monthly,
                'coverage': 100.0
            })

        # Sort by monthly price (None/unavailable last), then by yearly price
        response.sort(
            key=lambda x: (
                float('inf') if x['total_monthly_price'] is None else x['total_monthly_price'],
                float('inf') if x['total_yearly_by_monthly'] is None else x['total_yearly_by_monthly']
            )
        )

        # Return only top 3 combinations
        return response[:3]


class PackageCombinationViewBackup(views.APIView):
    """
    This is the backup version of the package combination view.
    if the first one fails to find a solution, this one will be used.

    this version removes the packages that does not contribute to the coverage
    starting from the most expensive one.
    """
    http_method_names = ['post']

    def post(self, request, *args, **kwargs):
        """
        Backup implementation that finds package combinations by removing non-essential packages,
        starting from the most expensive ones.
        
        Logic:
        1) Parse request data for teams, packages_to_exclude
        2) Get all games for the given teams
        3) Get all relevant packages with prefetching
        4) Sort packages by price (monthly, then yearly)
        5) Iteratively remove packages that don't reduce coverage
        6) Return the optimized combination
        """
        # 1) Parse request data
        teams = request.data.get('teams', [])
        packages_to_exclude = request.data.get('packages_to_exclude', []) or []
        
        # If no teams provided, nothing to do
        if not teams:
            return Response([])

        # 2) Get all games for these teams
        team_games = Game.objects.filter(
            Q(team_home__in=teams) | Q(team_away__in=teams)
        )
        team_games_ids = set(team_games.values_list('id', flat=True).distinct())

        # If no games for these teams, return empty
        if not team_games_ids:
            return Response([])

        # 3) Get all relevant packages covering at least one of these games with prefetching
        packages = StreamingPackage.objects.filter(
            streamingoffer__game__in=team_games_ids
        ).prefetch_related(
            Prefetch(
                'streamingoffer_set',
                queryset=StreamingOffer.objects.filter(game_id__in=team_games_ids),
                to_attr='relevant_offers'
            )
        ).distinct()

        # Exclude packages specified by the user
        if packages_to_exclude:
            packages = packages.exclude(id__in=packages_to_exclude)

        # 4) Convert to list and sort packages by price
        all_packages = list(packages)
        
        def get_package_sort_key(pkg):
            """Helper function to sort packages by monthly price, then yearly price"""
            monthly_price = pkg.monthly_price_cents or float('inf')  # No monthly price = most expensive
            yearly_price = pkg.monthly_price_yearly_subscription_in_cents or float('inf')
            return (monthly_price, yearly_price)
        
        all_packages.sort(key=get_package_sort_key, reverse=True)  # Sort descending (most expensive first)

        # 5) Calculate initial coverage
        def get_coverage(pkg_list):
            """Helper function to get total game coverage from a list of packages"""
            covered_games = set()
            for pkg in pkg_list:
                covered_games.update(offer.game_id for offer in pkg.relevant_offers)
            return covered_games

        initial_coverage = get_coverage(all_packages)
        
        # If we can't cover all games, return empty
        if len(initial_coverage) < len(team_games_ids):
            return Response([])

        # 6) Iteratively remove non-essential packages
        essential_packages = []
        remaining_packages = all_packages.copy()

        while remaining_packages:
            pkg_to_test = remaining_packages.pop(0)  # Remove most expensive package first
            
            # Try coverage without this package
            test_coverage = get_coverage(essential_packages + remaining_packages)
            
            if len(test_coverage) < len(team_games_ids):
                # This package is essential for full coverage
                essential_packages.append(pkg_to_test)

        # 7) Build and return the response with the essential packages
        if essential_packages:
            return Response(
                self._build_response(
                    [essential_packages]  # Just one optimized combo
                )
            )
        
        return Response([])

    def _build_response(self, combinations: List[List[StreamingPackage]]) -> List[Dict]:
        """
        Build response data for each combo
        """
        response = []
        for combo in combinations:
            # Calculate total prices
            total_monthly = sum((p.monthly_price_cents or 0) for p in combo)
            total_yearly_by_monthly = sum(
                (p.monthly_price_yearly_subscription_in_cents or 0) 
                for p in combo
            )

            response.append({
                'packages': StreamingPackageSerializer(combo, many=True).data,
                'total_monthly_price': total_monthly,
                'total_yearly_by_monthly': total_yearly_by_monthly,
                'coverage': 100.0
            })

        response.sort(key=lambda x: x['total_monthly_price'])
        return response

class StreamingPackageViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing all streaming packages"""
    queryset = StreamingPackage.objects.all()
    serializer_class = StreamingPackageSerializer