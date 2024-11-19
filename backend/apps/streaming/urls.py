from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StreamingViewSet, import_data

app_name = 'streaming'  # Add this line to define the app name

router = DefaultRouter()

urlpatterns = [
    path('compare-packages/', 
         StreamingViewSet.as_view({'post': 'compare_packages'}), 
         name='compare-packages'),
    path('available-teams/', 
         StreamingViewSet.as_view({'get': 'available_teams'}), 
         name='available-teams'),
    path('import-data/', import_data, name='import-data'),
    path('', include(router.urls)),
]