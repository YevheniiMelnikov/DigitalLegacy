from django.urls import path, include
from .views import UserRegistrationView, CurrentUserView

urlpatterns = [
    path("", include("djoser.urls")),
    path("", include("djoser.urls.jwt")),
    path("register/", UserRegistrationView.as_view(), name="user-register"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
]
