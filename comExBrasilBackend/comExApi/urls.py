from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'/getTreeMap', views.get_treeMap, name='treeMap'),
    url(r'/getStreamMap', views.get_streamMap, name='StreamMap'),
]