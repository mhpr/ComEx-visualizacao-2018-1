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
    pais_stat = False   

    def __init__(self, source, customer, **kwargs):
        
        for k, v in kwargs.items():
            setattr(self, k, v)
    @classmethod
    def buildPipe(cls,params):
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
            pais["PAIS_EN"] = params["pais"]

        if mes["MES"] :
            filter.append(mes)
        if pais:
            cls.pais_stat = True
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
        cls.pais_stat = False
        paises = collection.distinct("PAIS_EN")
        topPaises = []
        tpa = False
        match = cls.buildPipe(params)
        if cls.pais_stat:
            paises = [params["pais"]]
        if "tpr" or "tpa" in params:
            pipe0 = []
            pipe0.append({"$group" :{"_id": "$PAIS_EN", "valorTotal": {"$sum":"$VALOR"}, "quantidade": {"$sum":1} }})
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
        
        if match:
            pipe.append(match)

        #pipe.append({"$group":{"_id":{ "pais": "$PAIS_PT", "mes":"$MES"},"valorTotal": {"$sum":"$VALOR"}, "valorMedio": { "$avg": "$VALOR" }, "quantidade": {"$sum":1} }})
        pipe.append({"$group":{"_id":{ "pais": "$PAIS_EN", "mes":"$MES"},"valorTotal": {"$sum":"$VALOR"} }})
        pipe.append({"$sort":{"_id.mes":1}})        
        pointer = collection.aggregate(pipe)
        
        data = []
        old = 1
        mes = {}
        mes["mes"] = 1
        for line in pointer:
            current = line["_id"]["mes"]
            if old != current:
                
                print(mes)
                mes = cls.trataMes(mes,paises,topPaises)
                print("depois")
                print(mes)
                data.append(mes)
                mes = {}
                mes["mes"] = current

            if cls.pais_stat:
                print("aqui1")
                if line["_id"]["pais"] in paises:
                    mes[line["_id"]["pais"]] = line["valorTotal"] / 100000
            elif tpa:
                print("aqui2")
                if not (line["_id"]["pais"] in topPaises):
                    print("aqui3")
                    if not "outros" in mes :
                        print("aqui4")
                        mes["outros"] = 0
                    mes["outros"] += line["valorTotal"] / 100000
                else:
                    print("aqui5")
                    mes[line["_id"]["pais"]] = line["valorTotal"] / 100000
            elif not (line["_id"]["pais"] in topPaises):
                print("aqui6")
                mes[line["_id"]["pais"]] = line["valorTotal"] / 100000
            
            old = current

        if mes:
            print(mes)
            data.append(mes)
            
        
        print(paises)
        resp = {"paises":paises,"data":data}
        print(resp) 
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
