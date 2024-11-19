from django.db import models

class Game(models.Model):
    team_home = models.CharField(max_length=255)
    team_away = models.CharField(max_length=255)
    starts_at = models.DateTimeField()
    tournament_name = models.CharField(max_length=255)
    
    def __str__(self):
        return f"{self.team_home} vs {self.team_away} - {self.starts_at}"
    
    class Meta:
        indexes = [
            models.Index(fields=['team_home']),
            models.Index(fields=['team_away']),
            models.Index(fields=['starts_at']),
        ]

class StreamingPackage(models.Model):
    name = models.CharField(max_length=255)
    monthly_price_cents = models.IntegerField(null=True, blank=True)
    monthly_price_yearly_subscription_in_cents = models.IntegerField(null=True, blank=True)
    
    @property
    def monthly_price(self):
        return self.monthly_price_cents / 100 if self.monthly_price_cents is not None else None
    
    @property
    def yearly_price_monthly(self):
        return self.monthly_price_yearly_subscription_in_cents / 100 if self.monthly_price_yearly_subscription_in_cents is not None else None
    
    def __str__(self):
        return self.name

class StreamingOffer(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='streaming_offers')
    streaming_package = models.ForeignKey(StreamingPackage, on_delete=models.CASCADE, related_name='offers')
    live = models.BooleanField(default=False)
    highlights = models.BooleanField(default=False)
    
    class Meta:
        indexes = [
            models.Index(fields=['game', 'streaming_package']),
        ]