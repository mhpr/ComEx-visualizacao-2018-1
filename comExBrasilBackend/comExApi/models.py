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
    
    def buildPipe(params):
        mes = {}
        match = {}
        mes["MES"] = {}
        pais = {}
        filter = []
        if "lte" in params:
            mes["MES"]["$lte"] = params["lte"]
        if "gte" in params:
            mes["MES"]["$gte"] = params["gte"]

        if "pais" in params:
            pais["PAIS_PT"] = params["pais"]

        if mes["MES"] :
            filter.append(mes)
        if pais:
            filter.append(pais)
        if len(filter) > 0:
            match["$match"] = {"$and": filter}
        return match

    def trataMes(mes,paises,topPaises):
        for pais in paises:
            if (not pais in mes) and (not pais in topPaises):
                mes[pais] = 0
        return mes


    @classmethod
    def getStreamMap(cls, params ,imp=False, **kwargs):
        collection = cls.importacao_collection if imp else cls.exportacao_collection
        paises = collection.distinct("PAIS_PT")
        topPaises = []
        tpa = False
        if "tpr" or "tpa" in params:
            pipe0 = []
            pipe0.append({"$group" :{"_id": "$PAIS_PT", "valorTotal": {"$sum":"$VALOR"}, "quantidade": {"$sum":1} }})
            pipe0.append({"$sort":{"valorTotal":-1}})
            pointer0 = collection.aggregate(pipe0)
            i = 0
        if "tpr" in params:
            for line in pointer0:
                topPaises.append(line['_id'])
                i = i +1
                if i >= params["tpr"]:
                    break
            for pais in topPaises:
                paises.remove(pais)
        elif "tpa" in params:
            tpa = True
            for line in pointer0:
                topPaises.append(line['_id'])
                i = i +1
                if i >= params["tpa"]:
                    break
            topPaises.append("outros")
            paises = topPaises

        pipe = []
        match = cls.buildPipe(params)
        if match:
            pipe.append(match)

        #pipe.append({"$group":{"_id":{ "pais": "$PAIS_PT", "mes":"$MES"},"valorTotal": {"$sum":"$VALOR"}, "valorMedio": { "$avg": "$VALOR" }, "quantidade": {"$sum":1} }})
        pipe.append({"$group":{"_id":{ "pais": "$PAIS_PT", "mes":"$MES"},"valorTotal": {"$sum":"$VALOR"} }})
        pipe.append({"$sort":{"_id.mes":1}})        
        pointer = collection.aggregate(pipe)
        
        data = []
        old = 1
        mes = {}
        mes["mes"] = 1
        for line in pointer:
            current = line["_id"]["mes"]
            if old != current:
                mes = cls.trataMes(mes,paises,topPaises)
                data.append(mes)
                mes = {}
                mes["mes"] = current
            if tpa:
                if not (line["_id"]["pais"] in topPaises):
                    if not "outros" in mes :
                        mes["outros"] = 0
                    mes["outros"] += line["valorTotal"] / 100000
                else:
                    mes[line["_id"]["pais"]] = line["valorTotal"] / 100000
            elif not (line["_id"]["pais"] in topPaises):
                mes[line["_id"]["pais"]] = line["valorTotal"] / 100000
            old = current
        if mes:
            data.append(mes)
        
        print(paises)
        resp = {"paises":paises,"data":data} 
        return resp
    
    @classmethod
    def getTreeMap(cls, params, imp=False, **kwargs):
        pipe = []
        match = cls.buildPipe(params)
        if match:
            pipe.append(match)

        pipe.append({"$group" :{"_id":{ "paiNome": "$SUBSET", "filhoNome":"$PRODUTO"},"valorTotal": {"$sum":"$VALOR"},"pesoTotal": {"$sum":"$PESO_LIQUIDO_KG"},"quantidade": {"$sum":1} }})
        pipe.append({"$sort":{"valorTotal":-1,"_id.paiNome":1}})
        collection = cls.importacao_collection if imp else cls.exportacao_collection
        pointer = collection.aggregate(pipe)
        resp = {"name":"ROOT","children" :[]}
        contador = 0
        alocation = {}
        for line in pointer:
            name = line.pop("_id")
            if not (name["paiNome"] in alocation):
                alocation[name["paiNome"]] = contador
                contador = contador + 1
                resp["children"].append({"name":name["paiNome"],"children":[]})
        
            child = dict({"name":name["filhoNome"]},**line) 
            resp["children"][alocation[name["paiNome"]]]["children"].append(child)

        return resp
