from django.http import HttpResponse


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
    #events = models.Event.list(skip, limit, authenticated_user, **params)
    #return HttpResponse(json_util.dumps(events), content_type='application/json', status=200)