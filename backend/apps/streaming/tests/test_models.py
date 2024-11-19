from django.test import TestCase
from django.utils import timezone
from apps.streaming.models import Game, StreamingPackage, StreamingOffer
from datetime import datetime

class GameModelTests(TestCase):
    def setUp(self):
        self.game = Game.objects.create(
            team_home='Bayern München',
            team_away='Dortmund',
            starts_at=timezone.make_aware(datetime(2024, 6, 14, 19, 0)),
            tournament_name='Bundesliga'
        )

    def test_game_creation(self):
        self.assertEqual(self.game.team_home, 'Bayern München')
        self.assertEqual(self.game.team_away, 'Dortmund')
        self.assertEqual(self.game.tournament_name, 'Bundesliga')

class StreamingPackageTests(TestCase):
    def setUp(self):
        self.package = StreamingPackage.objects.create(
            name='Premium Package',
            monthly_price_cents=1000,
            monthly_price_yearly_subscription_in_cents=900
        )

    def test_package_creation(self):
        self.assertEqual(self.package.name, 'Premium Package')
        self.assertEqual(self.package.monthly_price_cents, 1000)
        self.assertEqual(self.package.monthly_price_yearly_subscription_in_cents, 900)

class StreamingOfferTests(TestCase):
    def setUp(self):
        self.game = Game.objects.create(
            team_home='Bayern München',
            team_away='Dortmund',
            starts_at=datetime.strptime('2024-06-14 19:00:00', '%Y-%m-%d %H:%M:%S'),
            tournament_name='Bundesliga'
        )
        self.package = StreamingPackage.objects.create(
            name='Premium Package',
            monthly_price_cents=1000,
            monthly_price_yearly_subscription_in_cents=900
        )
        self.offer = StreamingOffer.objects.create(
            game=self.game,
            streaming_package=self.package,
            live=True,
            highlights=True
        )

    def test_offer_creation(self):
        self.assertTrue(self.offer.live)
        self.assertTrue(self.offer.highlights)
        self.assertEqual(self.offer.game, self.game)
        self.assertEqual(self.offer.streaming_package, self.package)