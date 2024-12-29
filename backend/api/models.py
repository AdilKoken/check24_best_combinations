from django.db import models

class Game(models.Model):
    id = models.AutoField(primary_key=True)
    team_home = models.CharField(max_length=255)
    team_away = models.CharField(max_length=255)
    starts_at = models.DateTimeField()
    tournament_name = models.CharField(max_length=255)

    class Meta:
        db_table = 'games'

    def __str__(self):
        return f"{self.team_home} vs {self.team_away} ({self.tournament_name})"


class StreamingPackage(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    monthly_price_cents = models.IntegerField()
    monthly_price_yearly_subscription_in_cents = models.IntegerField()

    class Meta:
        db_table = 'packages'

    def __str__(self):
        return self.name


class StreamingOffer(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    streaming_package = models.ForeignKey(StreamingPackage, on_delete=models.CASCADE)
    live = models.BooleanField(default=False)
    highlights = models.BooleanField(default=False)

    class Meta:
        db_table = 'offers'

    def __str__(self):
        return f"{self.streaming_package.name} - {self.game}"