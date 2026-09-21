from rest_framework.generics import (
    ListAPIView, 
    CreateAPIView, 
    ListCreateAPIView, 
    RetrieveUpdateDestroyAPIView,
    RetrieveAPIView
)
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from accounts.models import CustomUser
from blog.models import Post, Tag
from .serializers import (
    ListCustomUserSerializer, 
    CustomUserSerializer, 
    CustomTokenObtainPairSerializer,
    TagSerializer,
    PostListSerializer,
    PostSerializer
)


# ==================== ACCOUNT VIEWS ====================

class CreateCustomUserApiView(CreateAPIView):
    serializer_class = CustomUserSerializer
    queryset = CustomUser.objects.all()
    authentication_classes = []
    permission_classes = []


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ListCustomUsersApiView(ListAPIView):
    serializer_class = ListCustomUserSerializer
    queryset = CustomUser.objects.all()


# ==================== BLOG VIEWS ====================

class TagListCreateApiView(ListCreateAPIView):
    """GET to list all tags, POST to create a new tag (Authenticated users)."""
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class PostListCreateApiView(ListCreateAPIView):
    """
    GET: List all published posts for the home feed (or draft posts if filtered/owned).
    POST: Create a new blog post block structure (Authenticated users).
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        # Use lightweight serializer for lists, full serializer for creation
        if self.request.method == 'POST':
            return PostSerializer
        return PostListSerializer

    def get_queryset(self):
        # By default, public feed shows only published posts
        queryset = Post.objects.filter(is_published=True).select_related('author').prefetch_related('tags')
        
        # Optional: Allow authors to see their own drafts if query param is passed or filter logic is desired
        tag_slug = self.request.query_params.get('tag')
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)
            
        return queryset


class PostDetailUpdateDestroyApiView(RetrieveUpdateDestroyAPIView):
    """
    GET: Read single post by slug (Public).
    PUT/PATCH/DELETE: Update or delete post (Only author can modify).
    """
    queryset = Post.objects.all().select_related('author').prefetch_related('tags')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'  # Medium URLs use slugs instead of IDs (e.g., /posts/my-first-post)

    def perform_update(self, serializer):
        # Ensure only the original author can edit their post
        post = self.get_object()
        if post.author != self.request.user and not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to edit this post.")
        serializer.save()

    def perform_destroy(self, instance):
        # Ensure only the original author can delete their post
        if instance.author != self.request.user and not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to delete this post.")
        instance.delete()