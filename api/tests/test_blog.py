from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import CustomUser
from blog.models import Post, Tag


class BlogTests(APITestCase):

    def setUp(self):
        # Create an author
        self.author = CustomUser.objects.create_user(
            email='author@example.com',
            username='authoruser',
            password='Password123!'
        )
        # Create another user for permission testing
        self.other_user = CustomUser.objects.create_user(
            email='other@example.com',
            username='otheruser',
            password='Password123!'
        )

        self.tag = Tag.objects.create(name='Tech', slug='tech')
        
        self.posts_url = reverse('api:post-list-create')
        self.tags_url = reverse('api:tag-list-create')

        # Sample Medium-style JSON block structure
        self.sample_content = [
            {"type": "header", "data": {"text": "Hello World", "level": 1}},
            {"type": "paragraph", "data": {"text": "This is a test block paragraph."}}
        ]

    def test_get_public_posts_feed(self):
        """Ensure unauthenticated users can view published posts."""
        Post.objects.create(
            title='Public Post',
            author=self.author,
            content=self.sample_content,
            is_published=True
        )
        response = self.client.get(self.posts_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check 'results' because DRF pagination is active
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Public Post')

    def test_create_post_authenticated(self):
        """Ensure authenticated users can create a post with JSON blocks and tags."""
        self.client.force_authenticate(user=self.author)
        payload = {
            'title': 'My New Medium Post',
            'subtitle': 'A guide to testing',
            'content': self.sample_content,
            'tag_ids': [self.tag.id],
            'is_published': True
        }
        response = self.client.post(self.posts_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Post.objects.count(), 1)
        
        post = Post.objects.first()
        self.assertEqual(post.slug, 'my-new-medium-post')
        self.assertEqual(len(post.content), 2)

    def test_create_post_unauthenticated_fails(self):
        """Ensure anonymous users cannot create posts."""
        payload = {
            'title': 'Unauthorized Post',
            'content': self.sample_content,
            'is_published': True
        }
        response = self.client.post(self.posts_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_post_detail_slug_lookup(self):
        """Ensure posts can be retrieved by their unique slug."""
        post = Post.objects.create(
            title='Unique Slug Test',
            author=self.author,
            content=self.sample_content,
            is_published=True
        )
        detail_url = reverse('api:post-detail', kwargs={'slug': post.slug})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Unique Slug Test')

    def test_unauthorized_user_cannot_delete_post(self):
        """Ensure non-authors cannot delete someone else's post."""
        post = Post.objects.create(
            title="Author's Post",
            author=self.author,
            content=self.sample_content,
            is_published=True
        )
        detail_url = reverse('api:post-detail', kwargs={'slug': post.slug})
        
        # Authenticate as a different user
        self.client.force_authenticate(user=self.other_user)
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)