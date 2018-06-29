from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'/getSomething', views.get_something, name='index'),
]