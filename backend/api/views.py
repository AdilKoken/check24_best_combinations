from rest_framework import viewsets, views
from rest_framework.response import Response
from django.db.models import Q, Count, Prefetch
from typing import List, Dict, Set
from .models import Game, StreamingPackage, StreamingOffer
from .serializers import StreamingPackageSerializer
from itertools import combinations

from .utils.package_optimizer import calculate_package_coverage, get_coverage



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
        7) Sort combos separately by monthly and yearly price and return both lists.
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
            return Response({
                'monthly_ordered': [],
                'yearly_ordered': []
            })

        # 2) Get all games for these teams
        team_games = Game.objects.filter(
            Q(team_home__in=teams) | Q(team_away__in=teams)
        )
        team_games_ids = set(team_games.values_list('id', flat=True).distinct())

        # If no games for these teams, return empty
        if not team_games_ids:
            return Response({
                'monthly_ordered': [],
                'yearly_ordered': []
            })

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

        # If free coverage alone covers everything, return that combo for both lists
        if games_to_cover == set():
            combo_data = self._build_response([free_packages_in_use], 'monthly')
            return Response({
                'monthly_ordered': combo_data,
                'yearly_ordered': combo_data
            })

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

                if games_to_cover_combo == set():
                    final_combo = list(free_packages_in_use) + list(combo)
                    all_covering_combos.append(final_combo)

        # 7) Build response with both monthly and yearly ordered combinations
        monthly_combos = self._build_response(all_covering_combos, 'monthly')
        yearly_combos = self._build_response(all_covering_combos, 'yearly')

        return Response({
            'monthly_ordered': monthly_combos[:3],  # Top 3 monthly combinations
            'yearly_ordered': yearly_combos[:3]     # Top 3 yearly combinations
        })

    def _build_response(self, combinations: List[List[StreamingPackage]], sort_by='monthly') -> List[Dict]:
        """Build response data for each combo with pricing and coverage"""
        response = []
        for combo in combinations:
            # Check if any package has null monthly price
            has_null_monthly = any(p.monthly_price_cents is None for p in combo)
            
            # Calculate totals
            total_monthly = None if has_null_monthly else sum(p.monthly_price_cents or 0 for p in combo)
            total_yearly_by_monthly = sum(p.monthly_price_yearly_subscription_in_cents or 0 for p in combo)
            
            response.append({
                'packages': StreamingPackageSerializer(combo, many=True).data,
                'total_monthly_price': total_monthly,
                'total_yearly_by_monthly': total_yearly_by_monthly,
                'coverage': 100.0  # Main view only returns 100% coverage combinations
            })

        # Sort based on the specified price type
        if sort_by == 'monthly':
            response.sort(key=lambda x: (
                float('inf') if x['total_monthly_price'] is None else x['total_monthly_price']
            ))
        else:  # yearly
            response.sort(key=lambda x: (
                float('inf') if x['total_yearly_by_monthly'] is None else x['total_yearly_by_monthly']
            ))

        return response


class PackageCombinationViewBackup(views.APIView):
    """
    This is the backup version of the package combination view.
    If the first one fails to find a solution, this one will be used.
    Returns the best possible combination even if it doesn't achieve 100% coverage.
    """
    http_method_names = ['post']

    def post(self, request, *args, **kwargs):
        """
        Backup implementation that finds package combinations by removing non-essential packages,
        starting from the most expensive ones. Returns the best coverage achieved.
        
        Logic:
        1) Parse request data for teams, packages_to_exclude
        2) Get all games for the given teams
        3) Get all relevant packages with prefetching
        4) Sort packages by price (monthly, then yearly)
        5) Iteratively remove packages that don't reduce coverage
        6) Return the optimized combination with coverage percentage
        """
        # 1) Parse request data
        teams = request.data.get('teams', [])
        packages_to_exclude = request.data.get('packages_to_exclude', []) or []
        
        # If no teams provided, nothing to do
        if not teams:
            return Response({
                'monthly_ordered': [],
                'yearly_ordered': []
            })

        # 2) Get all games for these teams
        team_games = Game.objects.filter(
            Q(team_home__in=teams) | Q(team_away__in=teams)
        )
        team_games_ids = set(team_games.values_list('id', flat=True).distinct())
        total_games = len(team_games_ids)

        # If no games for these teams, return empty
        if not total_games:
            return Response({
                'monthly_ordered': [],
                'yearly_ordered': []
            })

        # 3) Get all relevant packages with prefetching
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

        # 4) First separate free and paid packages
        free_packages = packages.filter(
            Q(monthly_price_cents__isnull=False) & Q(monthly_price_cents=0)
        )
        paid_packages = list(packages.exclude(id__in=free_packages.values_list('id', flat=True)))
        
        # Start with free packages coverage
        free_coverage = get_coverage(free_packages)
        remaining_games = set(team_games_ids) - free_coverage
        current_packages = list(free_packages)

        # 5) Sort paid packages by coverage first, then price
        def get_package_sort_key(pkg):
            """Helper function to sort packages by coverage (desc), then monthly price"""
            coverage = len(get_coverage([pkg]) & remaining_games)  # Only count coverage of remaining games
            monthly = pkg.monthly_price_cents or float('inf')
            yearly = pkg.monthly_price_yearly_subscription_in_cents or float('inf')
            return (-coverage, monthly, yearly)  # Negative coverage for descending order
        
        # Sort paid packages
        paid_packages.sort(key=get_package_sort_key)

        # 6) Add packages until we have full coverage or run out of packages
        for pkg in paid_packages:
            pkg_coverage = get_coverage([pkg])
            if remaining_games & pkg_coverage:  # If package covers any remaining game
                current_packages.append(pkg)
                remaining_games -= pkg_coverage
                
                if not remaining_games:  # Full coverage achieved
                    break

        # Calculate final coverage percentage
        final_coverage = get_coverage(current_packages)
        coverage_percentage = (len(final_coverage) / total_games) * 100

        # 7) Build response with monthly and yearly order
        monthly_combo = self._build_response(current_packages, coverage_percentage, 'monthly')
        yearly_combo = self._build_response(current_packages, coverage_percentage, 'yearly')

        return Response({
            'monthly_ordered': [monthly_combo],
            'yearly_ordered': [yearly_combo]
        })

    def _build_response(self, packages: List[StreamingPackage], coverage_percentage: float, sort_by='monthly') -> Dict:
        """
        Build response data for each combo, including coverage percentage.
        If any package in a combination has a null monthly price, the total monthly price
        for that combination will be null.
        """
        # Check if any package has null monthly price
        has_null_monthly = any(p.monthly_price_cents is None for p in packages)
            
        # Calculate totals
        total_monthly = None if has_null_monthly else sum(p.monthly_price_cents or 0 for p in packages)
        total_yearly_by_monthly = sum(p.monthly_price_yearly_subscription_in_cents or 0 for p in packages)

        return {
            'packages': StreamingPackageSerializer(packages, many=True).data,
            'total_monthly_price': total_monthly,
            'total_yearly_by_monthly': total_yearly_by_monthly,
            'coverage': round(coverage_percentage, 1)  # Round to 1 decimal place
        }

class StreamingPackageViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing all streaming packages"""
    queryset = StreamingPackage.objects.all()
    serializer_class = StreamingPackageSerializer