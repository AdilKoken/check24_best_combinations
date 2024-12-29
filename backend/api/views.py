from rest_framework import viewsets, views
from rest_framework.response import Response
from django.db.models import Q
from .models import Game, StreamingPackage, StreamingOffer
from .serializers import (
    GameSerializer,
    StreamingPackageSerializer,
    PackageCoverageSerializer,
    PackageCombinationSerializer
)
from .utils.package_optimizer import calculate_package_coverage, find_optimal_combinations

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

class PackageComparisonView(views.APIView):
    def post(self, request):
        """Compare packages for selected teams"""
        teams = request.data.get('teams', [])
        if not teams:
            return Response([])

        # Get all relevant games
        games = Game.objects.filter(
            Q(team_home__in=teams) | Q(team_away__in=teams)
        )
        game_ids = set(games.values_list('id', flat=True))

        # Calculate coverage for each package
        packages = StreamingPackage.objects.all()
        comparisons = []
        
        for package in packages:
            coverage = calculate_package_coverage(package, game_ids)
            comparison = {
                'package': package,
                'coverage': coverage
            }
            comparisons.append(comparison)

        # Sort by coverage percentage (descending)
        comparisons.sort(key=lambda x: x['coverage']['coverage_percentage'], reverse=True)
        
        serializer = PackageCoverageSerializer(comparisons, many=True)
        return Response(serializer.data)

class PackageCombinationView(views.APIView):
    def post(self, request):
        """Find optimal package combinations"""
        teams = request.data.get('teams', [])
        if not teams:
            return Response([])

        combinations = find_optimal_combinations(teams)
        serializer = PackageCombinationSerializer(combinations, many=True)
        return Response(serializer.data)

class TeamGamesView(views.APIView):
    def post(self, request):
        """Get all games for selected teams"""
        teams = request.data.get('teams', [])
        if not teams:
            return Response([])

        games = Game.objects.filter(
            Q(team_home__in=teams) | Q(team_away__in=teams)
        ).order_by('starts_at')
        
        serializer = GameSerializer(games, many=True)
        return Response(serializer.data)

class StreamingPackageViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing all streaming packages"""
    queryset = StreamingPackage.objects.all()
    serializer_class = StreamingPackageSerializer