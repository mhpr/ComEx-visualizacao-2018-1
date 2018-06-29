from pymongo import MongoClient
import sys
import csv
import time




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
        for respo in self.collection.find({key : value}).limit(1): 
            status = True

        return status

if __name__ == "__main__":
    uf = None
    municipios = None
    ncm = None
    exportacao = None

    uf = open('./csvData/UF.csv','r') 
    estados = csv.DictReader(uf, delimiter=';')

    mun = open('./csvData/VIA.csv','r')
    vias = csv.DictReader(mun, delimiter=';')

    ncm1 = open('./csvData/NCM.csv','r')
    ncm = csv.DictReader(ncm1, delimiter=';')

    pais = open('./csvData/PAIS.csv','r')
    country = csv.DictReader(pais, delimiter=';')

    exp = open('./csvData/EXP_2017.csv', 'r')
    exportacao = csv.DictReader(exp, delimiter=';')

    unit = open('./csvData/NCM_UNIDADE.csv', 'r')
    unidade = csv.DictReader(unit, delimiter=';')

    data=[]
    estados_mem=[]
    ncm_mem=[]
    vias_mem=[]
    country_mem=[]
    unidade_mem=[]
    exportacao_mem=[]

    for j in estados:      
        estados_mem.append(j)
    for k in ncm:
        ncm_mem.append(k)
    for l in vias:
        vias_mem.append(l)
    for m in country:
        country_mem.append(m)
    for n in unidade:    
        unidade_mem.append(n)

    for index, i in enumerate(exportacao):
        auxHash = {}
        for j in estados_mem:
            if i['CO_UF'] == j['CO_UF']:
                auxHash['SIGLA'] = j['SG_UF']
                auxHash['ESTADO'] = j['NO_UF']   
                break
            

        for k in ncm_mem:
            if i['CO_NCM'] == k['CO_NCM']:
                auxHash['PRODUTO'] = k['NO_NCM_POR']
                auxHash['SUBSET'] = k['CO_EXP_SUBSET']
                auxHash['PPE'] = k['CO_PPE']
                break

        for l in vias_mem:
            if i['CO_VIA'] == l['CO_VIA']:
                auxHash['VIA'] = l['NO_VIA']
                break

        for m in country_mem:
            if i['CO_PAIS'] == m['CO_PAIS']:
                auxHash['PAIS_PT'] = m['NO_PAIS']
                auxHash['PAIS_EN'] = m['NO_PAIS_ING']
                break
        
        for n in unidade_mem:
            if i['CO_UNID']==n['CO_UNID']:
                auxHash['NOME_UNIDADE'] = n['NO_UNID']
                auxHash['SIGLAS_UNIDADE'] = n['SG_UNID']
                break
        print("auxHash antes = {}".format(auxHash))
        #print("{} %".format(porcent))
        #time.sleep(1)
        auxHash['ANO'] = i['CO_ANO']
        auxHash['MES'] = i['CO_MES']
        auxHash['QT_ESTAT'] = i['QT_ESTAT']
        auxHash['PESO_LIQUIDO_KG'] = i['KG_LIQUIDO']
        auxHash['VALOR'] = i['VL_FOB']

        data.append(auxHash)

    print(data[0])
    print(data[1])
    print(data[2])
    print(data[3])
    MA = MongoApi("comExBrasil","exp")
    MA.insertIntoDb(data)

    
