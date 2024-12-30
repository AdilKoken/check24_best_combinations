# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TeamListView,
    PackageListView,
    PackagesByTeamsView,
    PackagesByTeamsViewSoft,
    StreamingPackageViewSet
)

router = DefaultRouter()
router.register(r'streaming-packages', StreamingPackageViewSet)  # Changed this route

urlpatterns = [
    path('teams/', TeamListView.as_view(), name='team-list'),
    path('packages/', PackageListView.as_view(), name='package-list'),
    path('packages/by-teams/', PackagesByTeamsView.as_view(), name='packages-by-teams'),
    path('packages/by-teams-soft/', PackagesByTeamsViewSoft.as_view(), name='packages-by-teams-soft'),
    path('', include(router.urls))
]