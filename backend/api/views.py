from rest_framework import viewsets, views
from rest_framework.response import Response
from django.db.models import Q, Count
from .models import Game, StreamingPackage, StreamingOffer
from .serializers import (
    GameSerializer,
    StreamingPackageSerializer,
)
from .utils.package_optimizer import calculate_package_coverage, find_optimal_combinations

class TeamListView(views.APIView):
    def get(self, request):
        """Get all unique team names"""
        teams = Game.objects.values('team_home').annotate(team=F('team_home')).values('team').union(
            Game.objects.values('team_away').annotate(team=F('team_away')).values('team')
        ).order_by('team')
        
        return Response([team['team'] for team in teams])
    
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
    
class StreamingPackageViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing all streaming packages"""
    queryset = StreamingPackage.objects.all()
    serializer_class = StreamingPackageSerializer