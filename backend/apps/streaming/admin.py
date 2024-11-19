from django.contrib import admin
from .models import Game, StreamingPackage, StreamingOffer

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('id', 'team_home', 'team_away', 'starts_at', 'tournament_name')
    list_filter = ('tournament_name', 'starts_at')
    search_fields = ('team_home', 'team_away', 'tournament_name')
    ordering = ('starts_at',)

@admin.register(StreamingPackage)
class StreamingPackageAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'monthly_price_display', 'yearly_price_monthly_display')
    search_fields = ('name',)

    def monthly_price_display(self, obj):
        return f'€{obj.monthly_price_cents/100:.2f}' if obj.monthly_price_cents else '-'
    monthly_price_display.short_description = 'Monthly Price'

    def yearly_price_monthly_display(self, obj):
        return f'€{obj.monthly_price_yearly_subscription_in_cents/100:.2f}' if obj.monthly_price_yearly_subscription_in_cents else '-'
    yearly_price_monthly_display.short_description = 'Monthly Price (Yearly Sub)'

@admin.register(StreamingOffer)
class StreamingOfferAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_game_display', 'get_package_name', 'live', 'highlights')
    list_filter = ('live', 'highlights', 'streaming_package')
    search_fields = ('game__team_home', 'game__team_away', 'streaming_package__name')

    def get_game_display(self, obj):
        return f'{obj.game.team_home} vs {obj.game.team_away}'
    get_game_display.short_description = 'Game'

    def get_package_name(self, obj):
        return obj.streaming_package.name
    get_package_name.short_description = 'Package'