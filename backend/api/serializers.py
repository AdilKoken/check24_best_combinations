from rest_framework import serializers
from .models import Game, StreamingPackage, StreamingOffer

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'team_home', 'team_away', 'starts_at', 'tournament_name']


class StreamingPackageSerializer(serializers.ModelSerializer):
    monthly_price = serializers.SerializerMethodField()
    yearly_price = serializers.SerializerMethodField()

    class Meta:
        model = StreamingPackage
        fields = [
            'id', 
            'name', 
            'monthly_price_cents',
            'monthly_price_yearly_subscription_in_cents',
            'monthly_price',
            'yearly_price'
        ]

    def get_monthly_price(self, obj):
        return obj.monthly_price_cents / 100 if obj.monthly_price_cents else None

    def get_yearly_price(self, obj):
        if obj.monthly_price_yearly_subscription_in_cents:
            return (obj.monthly_price_yearly_subscription_in_cents * 12) / 100
        return None

class StreamingOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = StreamingOffer
        fields = ['game', 'streaming_package', 'live', 'highlights']