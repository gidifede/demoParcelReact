
import time
import string
import uuid
import random
from datetime import datetime, timezone
from urllib import request
import json


def get_timestamp():
    return datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

# curl --location 'https://ou8s3gknh3.execute-api.eu-central-1.amazonaws.com/dev/v1/preadvising/scan' --header 'x-api-key: g1QS1kszspaxh1fwnf4BE7igj3Mc1jfX8VRG6297' --header 'Content-Type: application/json' --data '{
#   "id": "7f867ec0-38bc-44ff-be5b-75d096cfeecc",
#   "source": "Logistic.MF.ZebraCam",
#   "specversion": "1.0",
#   "type": "Logistic.PCL.Preadvising.Scan",
#   "datacontenttype": "application/json",
#   "data": {
#                 "parcel": {
#                   "ldv": {
#                         "id": "F212D78786281"
#                   }
#                 },
#                 "receiver": {
#                   "name": "Arianna Barletta",
#                   "address": "Via dei Magazzini Generali 31",
#                   "zipcode": "00154",
#                   "city": "ROMA",
#                   "nation": "IT"
#                 },
#                 "timestamp": "2024-05-15T10:19:41.812Z"
#     }
# }
# '


def send_request(payload):
    url = 'https://ou8s3gknh3.execute-api.eu-central-1.amazonaws.com/dev/v1/preadvising/scan'
    api_key = "g1QS1kszspaxh1fwnf4BE7igj3Mc1jfX8VRG6297"

    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }

    print(payload)

    # parse.urlencode(payload).encode()
    data = json.dumps(payload).encode("utf-8")
    # this will make the method "POST"
    req = request.Request(url, headers=headers, data=data)
    resp = request.urlopen(req)
    print(resp)


first_names = ["Franco", "Luigi", "Norberto", "Teodoro"]
last_names = ["Perbellini", "Cloromezzi", "Scumbiglio", "Marda"]
zipcodes = ["00142", "00155", "00167", "00132", "00122"]
addresses = ["via le dita dal naso, 2", "via la polizia, 5",
             "viale lungo, 1", "via andrea scarpiello, 55"]

payload = {
    "id": "7f867ec0-38bc-44ff-be5b-75d096cfeecc",
    "source": "Logistic.MF.ZebraCam",
    "specversion": "1.0",
    "type": "Logistic.PCL.Preadvising.Scan",
    "datacontenttype": "application/json",
    "data": {
        "parcel": {
          "ldv": {
              "id": "F212D78786281"
          }
        },
        "receiver": {
            "name": "Arianna Barletta",
            "address": "Via dei Magazzini Generali 31",
            "zipcode": "00154",
            "city": "ROMA",
            "nation": "IT"
        },
        "timestamp": "2024-05-15T10:19:41.812Z"
    }
}


def random_ldv():

    res_part1 = ''.join(random.choices(string.ascii_uppercase +
                                       string.digits, k=4))

    res_part2 = ''.join(random.choices(string.digits, k=6))

    return f"{res_part1}{res_part2}"


while True:
    payload["id"] = str(uuid.uuid1())
    payload["data"]["parcel"]["ldv"]["id"] = random_ldv()
    payload["data"]["receiver"]["name"] = "{} {}".format(
        random.choice(first_names), random.choice(last_names))
    payload["data"]["receiver"]["address"] = random.choice(addresses)
    payload["data"]["receiver"]["zipcode"] = random.choice(zipcodes)
    payload["data"]["timestamp"] = get_timestamp()

    send_request(payload=payload)

    time.sleep(5)
