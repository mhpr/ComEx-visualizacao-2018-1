from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'/getSomething', views.index, name='index'),
]