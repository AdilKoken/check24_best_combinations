from rest_framework import serializers
from .models import Game, StreamingPackage, StreamingOffer

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'team_home', 'team_away', 'starts_at', 'tournament_name']


class StreamingPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = StreamingPackage
        fields = ['id', 'name', 'monthly_price_cents', 'monthly_price_yearly_subscription_in_cents']


class StreamingOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = StreamingOffer
        fields = ['game', 'streaming_package', 'live', 'highlights']


class PackageCoverageSerializer(serializers.Serializer):
    package = StreamingPackageSerializer()
    coverage = serializers.DictField(
        child=serializers.IntegerField(),
        default={
            'total_matches': 0,
            'live_matches': 0,
            'highlights_only': 0,
            'coverage_percentage': 0
        }
    )


class PackageCombinationSerializer(serializers.Serializer):
    packages = StreamingPackageSerializer(many=True)
    total_monthly_cost = serializers.FloatField()
    total_yearly_cost = serializers.FloatField()
    coverage = serializers.DictField(
        child=serializers.IntegerField(),
        default={
            'total_matches': 0,
            'live_matches': 0,
            'highlights_only': 0,
            'coverage_percentage': 0
        }
    )