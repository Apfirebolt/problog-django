from rest_framework import serializers
from accounts.models import CustomUser
from blog.models import Post, Tag
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


# ==================== ACCOUNT SERIALIZERS ====================

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    default_error_messages = {
        'no_active_account': 'No account exists with these credentials, check password and email'
    }

    def validate(self, attrs):
        data = super().validate(attrs)
        # Custom data 
        data.update({'userData': {
            'email': self.user.email,
            'username': self.user.username,
            'id': self.user.id
        }})
        return data


class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        help_text='Leave empty if no change needed',
        min_length=8,
        style={'input_type': 'password', 'placeholder': 'Password'}
    )
    access = serializers.SerializerMethodField()
    refresh = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'id', 'is_staff', 'password', 'access', 'refresh',)
    
    def get_refresh(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh)

    def get_access(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)


class ListCustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'firstName', 'lastName', 'is_staff',)


# ==================== BLOG SERIALIZERS ====================

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name', 'slug')
        read_only_fields = ('slug', 'id')


class PostListSerializer(serializers.ModelSerializer):
    """Lighter serializer for displaying posts in a feed (Medium homepage) without heavy content blocks."""
    author_username = serializers.ReadOnlyField(source='author.username')
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = (
            'id', 'title', 'slug', 'subtitle', 'author_username', 
            'cover_image', 'tags', 'is_published', 'created_at'
        )


class PostSerializer(serializers.ModelSerializer):
    """Detailed serializer for creating, updating, and viewing full individual blog posts."""
    author_username = serializers.ReadOnlyField(source='author.username')
    tags = TagSerializer(many=True, read_only=True)
    # Allows writing tags by passing an array of Tag IDs (e.g., "tag_ids": [1, 2, 3])
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, source='tags', required=False
    )

    class Meta:
        model = Post
        fields = (
            'id', 'title', 'slug', 'subtitle', 'author', 'author_username',
            'content', 'cover_image', 'tags', 'tag_ids', 'is_published',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'slug', 'author', 'created_at', 'updated_at')

    def validate_content(self, value):
        """Validates that incoming content from Next.js is a valid structured block list."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Content must be a list of blocks.")
        
        for index, block in enumerate(value):
            if not isinstance(block, dict):
                raise serializers.ValidationError(f"Block at index {index} must be a JSON object.")
            if 'type' not in block or 'data' not in block:
                raise serializers.ValidationError(f"Block at index {index} must contain 'type' and 'data' keys.")
            if not isinstance(block['data'], dict):
                raise serializers.ValidationError(f"'data' in block at index {index} must be an object.")
                
        return value

    def create(self, validated_data):
        # Automatically assign the currently authenticated request user as the author
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['author'] = request.user
        return super().create(validated_data)