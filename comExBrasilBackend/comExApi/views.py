from django.http import HttpResponse
from comExApi import models
from rest_framework.decorators import api_view
from bson import json_util, ObjectId

def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")

@api_view(['GET'])
def get_something(request, *args, **kwargs):
    #params = url_params(request)
    #authenticated_user = kwargs['authenticated_user']
    #skip = params['skip']
    #limit = params['limit']
    #del params['skip']
    #del params['limit']
    resp = models.Api.getSome()
    return HttpResponse(json_util.dumps(resp), content_type='application/json', status=200)