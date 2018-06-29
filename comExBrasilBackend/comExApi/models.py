from django.db import models
from bson import ObjectId
import datetime
import pymongo
import json
import re

# Create your models here.
class Api(object):
    mongo_client = pymongo.MongoClient()
    exportacao_collection = mongo_client["comExBrasil"]["exp"]
    importacao_collection = mongo_client["comExBrasil"]["imp"]

    def __init__(self, source, customer, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

    @classmethod
    def getSome(cls, imp=False, **kwargs):
        collection = cls.importacao_collection if imp else cls.exportacao_collection
        resp = collection.find().limit(10)
        return resp
