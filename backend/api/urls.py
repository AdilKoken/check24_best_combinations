# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TeamListView,
    TeamSearchView,
    PackageListView,
    PackagesByTeamsView,
    PackagesByTeamsViewSoft,
    PackageCombinationView,
    PackageCombinationViewBackup,
    StreamingPackageViewSet
)

router = DefaultRouter()
router.register(r'streaming-packages', StreamingPackageViewSet)

urlpatterns = [
    path('teams/', TeamListView.as_view()),
    path('teams/search/', TeamSearchView.as_view()),
    path('packages/', PackageListView.as_view()),
    path('packages/by-teams/', PackagesByTeamsView.as_view()),
    path('packages/by-teams-soft/', PackagesByTeamsViewSoft.as_view()),
    path('packages/combinations/', PackageCombinationView.as_view()),
    path('packages/combinations-backup/', PackageCombinationViewBackup.as_view()),
]