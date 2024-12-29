from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TeamListView,
    TeamSearchView,
    PackageComparisonView,
    PackageCombinationView,
    TeamGamesView,
    StreamingPackageViewSet
)

router = DefaultRouter()
router.register(r'packages', StreamingPackageViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('teams/', TeamListView.as_view(), name='team-list'),
    path('teams/search/', TeamSearchView.as_view(), name='team-search'),
    path('packages/compare/', PackageComparisonView.as_view(), name='package-compare'),
    path('packages/combinations/', PackageCombinationView.as_view(), name='package-combinations'),
    path('games/teams/', TeamGamesView.as_view(), name='team-games'),
]