from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    ListCustomUsersApiView, 
    CreateCustomUserApiView, 
    CustomTokenObtainPairView,
    TagListCreateApiView,
    PostListCreateApiView,
    PostDetailUpdateDestroyApiView
)

urlpatterns = [
    # --- Auth & User URLs ---
    path('register', CreateCustomUserApiView.as_view(), name='signup'),
    path('login', CustomTokenObtainPairView.as_view(), name='signin'),
    path('refresh', TokenRefreshView.as_view(), name='refresh'),
    path('users', ListCustomUsersApiView.as_view(), name='list-users'),

    # --- Blog URLs ---
    path('tags', TagListCreateApiView.as_view(), name='tag-list-create'),
    path('posts', PostListCreateApiView.as_view(), name='post-list-create'),
    path('posts/<slug:slug>', PostDetailUpdateDestroyApiView.as_view(), name='post-detail'),
]