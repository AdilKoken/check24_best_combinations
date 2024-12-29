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
    
class PackagesByTeamsView(views.APIView):
    http_method_names = ['post']
    
    def post(self, request, *args, **kwargs):
        """Get packages that offer all games for selected teams"""
        print("Received request method:", request.method)
        print("Received content type:", request.content_type)
        print("Received data:", request.data)
        
        teams = request.data.get('teams', [])
        print("Extracted teams:", teams)
        
        if not teams:
            return Response([])
            
        # Get all games involving the selected teams
        team_games = Game.objects.filter(
            Q(team_home__in=teams) | Q(team_away__in=teams)
        )
        print("Found games:", team_games.count())
        
        # Get packages that cover all these games
        packages = StreamingPackage.objects.filter(
            streamingoffer__game__in=team_games,
            streamingoffer__live=True
        ).distinct()
        print("Found packages:", packages.count())
        
        serializer = StreamingPackageSerializer(packages, many=True)
        return Response(serializer.data)
class StreamingPackageViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing all streaming packages"""
    queryset = StreamingPackage.objects.all()
    serializer_class = StreamingPackageSerializer