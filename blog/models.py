from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.contrib.postgres.indexes import GinIndex


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True, max_length=50, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Post(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255, blank=True)
    subtitle = models.CharField(max_length=500, blank=True, null=True)
    
    # foreign key to the author (CustomUser model)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='posts'
    )
    
    # PostgreSQL JSONField to store rich text/media blocks from Next.js
    content = models.JSONField(
        default=list, 
        help_text="Structured JSON blocks (paragraphs, images, headers) from the frontend editor."
    )
    
    cover_image = models.ImageField(upload_to='post_covers/', blank=True, null=True)
    tags = models.ManyToManyField(Tag, related_name='posts', blank=True)
    
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            # for fast searching
            GinIndex(fields=['content'], name='post_content_gin_idx'),
            models.Index(fields=['slug'], name='post_slug_idx'),
            models.Index(fields=['is_published', '-created_at'], name='post_published_date_idx'),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            # Ensures uniqueness if duplicate post titles are created
            while Post.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title