from rest_framework import serializers
from .models import Game, StreamingPackage, StreamingOffer

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'team_home', 'team_away', 'starts_at', 'tournament_name']

class StreamingPackageSerializer(serializers.ModelSerializer):
    monthly_price = serializers.FloatField(read_only=True)
    yearly_price_monthly = serializers.FloatField(read_only=True)
    
    class Meta:
        model = StreamingPackage
        fields = ['id', 'name', 'monthly_price', 'yearly_price_monthly']

class StreamingOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = StreamingOffer
        fields = ['id', 'game', 'streaming_package', 'live', 'highlights']

class PackageComparisonSerializer(serializers.ModelSerializer):
    total_matches = serializers.IntegerField()
    live_matches = serializers.IntegerField()
    highlights_matches = serializers.IntegerField()
    coverage_percentage = serializers.FloatField()
    
    class Meta:
        model = StreamingPackage
        fields = [
            'id', 'name', 'monthly_price', 'yearly_price_monthly',
            'total_matches', 'live_matches', 'highlights_matches',
            'coverage_percentage'
        ]