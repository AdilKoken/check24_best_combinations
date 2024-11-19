from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone
from apps.streaming.models import Game, StreamingPackage, StreamingOffer
from datetime import datetime
import json

class StreamingViewSetTests(TestCase):
    def setUp(self):
        self.client = Client()
        # Create test data with timezone-aware datetime
        self.game = Game.objects.create(
            team_home='Bayern München',
            team_away='Dortmund',
            starts_at=timezone.make_aware(datetime(2024, 6, 14, 19, 0)),
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

    def test_available_teams(self):
        response = self.client.get(reverse('streaming:available-teams'))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertTrue('teams' in data)
        self.assertEqual(len(data['teams']), 2)  # Bayern München and Dortmund
        self.assertIn('Bayern München', data['teams'])
        self.assertIn('Dortmund', data['teams'])

    def test_compare_packages(self):
        response = self.client.post(
            reverse('streaming:compare-packages'),
            data=json.dumps({'teams': ['Bayern München']}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertTrue('total_games' in data)
        self.assertTrue('packages' in data)
        self.assertEqual(data['total_games'], 1)
        self.assertEqual(len(data['packages']), 1)