from django.http import HttpResponse
from comExApi import models
from rest_framework.decorators import api_view
from bson import json_util, ObjectId
import urllib.parse
import random
import string
import json


def url_params(request):
    p = urllib.parse.parse_qs(request.META['QUERY_STRING'])
    params = dict()
    for k, v in p.items():
        real_val = v[0] if isinstance(v, list) and len(v) == 1 else v
        try:
            real_val = json.loads(real_val)
        except:
            pass
        params[k] = real_val
    return params

def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")

@api_view(['GET'])
def get_something(request, *args, **kwargs):
    params = url_params(request)
    print(params)
    #authenticated_user = kwargs['authenticated_user']
    #skip = params['skip']
    #limit = params['limit']
    #del params['skip']
    #del params['limit']
    resp = models.Api.getSome()
    return HttpResponse(json_util.dumps(resp), content_type='application/json', status=200)