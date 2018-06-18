from django.db import models
from bson import ObjectId
import datetime
import pymongo
import json
import re

# Create your models here.
class Api(object):
    mongo_client = pymongo.MongoClient()
    events_collection = mongo_client[settings.MONGO_EVENTS_DATABASE][settings.MONGO_EVENTS_COLLECTION]
    history_collection = mongo_client[settings.MONGO_EVENTS_DATABASE][settings.MONGO_EVENTS_HISTORY_COLLECTION])

    def __init__(self, source, customer, **kwargs):
        self.source = source
        self.customer = customer
        for k, v in kwargs.items():
            setattr(self, k, v)

    def save(self):
        return self.events_collection.insert_one(vars(self))