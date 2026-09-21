from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import CustomUser


class UserTests(APITestCase):

    def setUp(self):
        self.register_url = reverse('api:signup')
        self.login_url = reverse('api:signin')
        self.user_data = {
            'email': 'testuser@example.com',
            'username': 'testuser',
            'password': 'StrongPassword123!',
            'firstName': 'Test',
            'lastName': 'User'
        }
        # Create a pre-existing user for login tests
        self.user = CustomUser.objects.create_user(
            email='existing@example.com',
            username='existinguser',
            password='Password123!'
        )

    def test_user_registration(self):
        """Ensure we can create a new user via the signup endpoint."""
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CustomUser.objects.count(), 2)
        self.assertEqual(CustomUser.objects.get(email='testuser@example.com').username, 'testuser')

    def test_user_login(self):
        """Ensure a registered user can log in and receive custom JWT tokens with userData."""
        payload = {
            'email': 'existing@example.com',
            'password': 'Password123!'
        }
        response = self.client.post(self.login_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('userData', response.data)
        self.assertEqual(response.data['userData']['email'], 'existing@example.com')