from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.db.models import Count, Q, F
from django.db.models.functions import Coalesce
from django.core.management import call_command
from .models import Game, StreamingPackage, StreamingOffer
from .serializers import (
    GameSerializer, StreamingPackageSerializer, 
    StreamingOfferSerializer, PackageComparisonSerializer
)

class StreamingViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def compare_packages(self, request):
        teams = request.data.get('teams', [])
        if not teams:
            return Response(
                {"error": "No teams selected"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        games = Game.objects.filter(
            Q(team_home__in=teams) | Q(team_away__in=teams)
        )
        total_games = games.count()

        if total_games == 0:
            return Response(
                {"error": "No games found for selected teams"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        packages = StreamingPackage.objects.annotate(
            total_matches=Count(
                'offers__game',
                filter=Q(offers__game__in=games),
                distinct=True
            ),
            live_matches=Count(
                'offers__game',
                filter=Q(offers__game__in=games, offers__live=True),
                distinct=True
            ),
            highlights_matches=Count(
                'offers__game',
                filter=Q(offers__game__in=games, offers__highlights=True),
                distinct=True
            ),
            coverage_percentage=Coalesce(
                100.0 * F('total_matches') / total_games,
                0.0
            )
        ).order_by('-coverage_percentage', 'monthly_price_yearly_subscription_in_cents')

        serializer = PackageComparisonSerializer(packages, many=True)
        
        return Response({
            'total_games': total_games,
            'packages': serializer.data
        })

    @action(detail=False, methods=['get'])
    def available_teams(self, request):
        home_teams = Game.objects.values_list('team_home', flat=True).distinct()
        away_teams = Game.objects.values_list('team_away', flat=True).distinct()
        all_teams = sorted(set(list(home_teams) + list(away_teams)))
        
        return Response({
            'teams': all_teams
        })

@api_view(['POST'])
@permission_classes([IsAdminUser])
def import_data(request):
    try:
        call_command('import_data')
        return Response({
            'status': 'success',
            'message': 'Data imported successfully'
        })
    except Exception as e:
        return Response(
            {
                'status': 'error',
                'message': str(e)
            }, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )