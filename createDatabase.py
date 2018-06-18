from pymongo import MongoClient
import sys

class MongoApi:
    def __init__(self, db, collection, ip='127.0.0.1', port=27017): 
        self.mongo_client = MongoClient(ip, port)
        print(self.mongo_client)
        self.db = self.mongo_client[db]
        print(self.db)
        self.collection = self.db[collection]
        print(self.collection)

    def insertIntoDb(self, data, retryNum=5, debug=True):
        resp = None
        while(retryNum > 0):
            try:
                resp = self.collection.insert_many(data)
                break
            except Exception as e: 
                retryNum = retryNum - 1
                if(debug):
                    print("error on nsert_into_bd => ", sys.exc_info()[0])
                    print("erro => {}".format(e))
        return resp 

    def isOnDb(self, key, value):
        status = False
        for respo in self.collection.find({key : value}).limit(1): #
            status = True

        return status

