import { makeAutoObservable, runInAction } from 'mobx';
import httpClient from '../plugins/interceptor';

class BlogStore {
  posts = [];
  currentPost = null;
  tags = [];
  loading = false;
  error = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  // Helper to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Fetch all posts (Feed)
  async fetchPosts() {
    this.loading = true;
    this.error = null;
    try {
      const response = await httpClient.get('blog/posts');
      runInAction(() => {
        this.posts = response.data;
        this.loading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err.response?.data || 'Failed to fetch posts';
        this.loading = false;
      });
    }
  }

  // Fetch a single post by slug
  async fetchPostBySlug(slug) {
    this.loading = true;
    this.error = null;
    try {
      const response = await httpClient.get(`blog/posts/${slug}`);
      runInAction(() => {
        this.currentPost = response.data;
        this.loading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err.response?.data || 'Post not found';
        this.loading = false;
      });
    }
  }

  // Create a new post
  async createPost(postData) {
    this.loading = true;
    this.error = null;
    try {
      const response = await httpClient.post(
        'blog/posts', 
        postData, 
        { headers: this.getAuthHeaders() }
      );
      runInAction(() => {
        this.posts.unshift(response.data);
        this.loading = false;
      });
      return response.data;
    } catch (err) {
      runInAction(() => {
        this.error = err.response?.data || 'Failed to create post';
        this.loading = false;
      });
      return null;
    }
  }

  // Update an existing post
  async updatePost(slug, postData) {
    this.loading = true;
    this.error = null;
    try {
      const response = await httpClient.put(
        `blog/posts/${slug}`, 
        postData, 
        { headers: this.getAuthHeaders() }
      );
      runInAction(() => {
        this.currentPost = response.data;
        this.posts = this.posts.map(p => p.slug === slug ? response.data : p);
        this.loading = false;
      });
      return response.data;
    } catch (err) {
      runInAction(() => {
        this.error = err.response?.data || 'Failed to update post';
        this.loading = false;
      });
      return null;
    }
  }

  // Delete a post
  async deletePost(slug) {
    this.loading = true;
    try {
      await httpClient.delete(
        `blog/posts/${slug}`, 
        { headers: this.getAuthHeaders() }
      );
      runInAction(() => {
        this.posts = this.posts.filter(p => p.slug !== slug);
        this.loading = false;
      });
      return true;
    } catch (err) {
      runInAction(() => {
        this.error = err.response?.data || 'Failed to delete post';
        this.loading = false;
      });
      return false;
    }
  }

  // Fetch tags for filtering/categorization
  async fetchTags() {
    try {
      const response = await httpClient.get('blog/tags/');
      runInAction(() => {
        this.tags = response.data;
      });
    } catch (err) {
      console.error('Failed to fetch tags', err);
    }
  }
}

export default BlogStore;