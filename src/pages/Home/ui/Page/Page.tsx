import WebSocketConnect from "@/websocket/Websocket";
import { FC, useEffect, useState } from "react";
import "./Grid.css"
import "./Cell.css"
import "./page.css"
// import { addToStorage, getFromStorage } from "@/app/store";
import { AudioPlayer, callTextToSpeectApi } from "../Common";


const PARCELS_LIMIT_IN_BAG = 3
const PARCEL_WEIGHT_LIMIT_IN_BAG = 15


const ParcelStatus = ({ ldv }: any) => {

  const [ldvStatus, setLdvStatus] = useState<any>("");
  const [ldvRank, setLdvRank] = useState<any>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true)
  }, [ldv]);

  function updateUi(event: any) {
    console.log("parcel status update component", event)
    setLoading(false)
    setLdvStatus(event.data.message)
    setLdvRank(event.data.rank)
  }

  var rankClass = ""
  if (ldvRank >= 3) {
    rankClass = "text-red-500"
  }
  if (ldvRank == 1 || ldvRank == 2) {
    rankClass = "text-green-500"
  }

  return (
    <div>
      <div className="m-10">
        {loading &&
          <>
            <div className="flex flex-row">
              <img style={{ width: "20px", height: "20px" }} src="images/loading.gif" /> <span className="ml-3">verifico lo stato del pacco</span>
            </div>
          </>
        }
        {ldvStatus &&
          <div className="bg-base-400 grid justify-items-center">
            <p className={`${rankClass} text-2xl`}>{ldvStatus}</p>
          </div>
        }
      </div>
      <WebSocketConnect
        subcriptionKey={"parcel_status_received#*"}

        onMessageReceived={(event) => {
          console.log("parcel status event received", event)
          updateUi(event);
        }}
      />
    </div>
  )

}


function getCompletionPercentage(num_parcels: number, total: number) {
  return (100 * num_parcels) / total;
}

function round(num: number) {
  return Math.round((num + Number.EPSILON) * 100) / 100
}


const Cell = ({ numItems, totalWeight }: any) => {


  // const percentage = fillPercentage >= 100 ? 100 : fillPercentage

  var parcelPercentage = getCompletionPercentage(numItems, PARCELS_LIMIT_IN_BAG)
  parcelPercentage = parcelPercentage >= 100 ? 100 : parcelPercentage
  const fillClassParcel = parcelPercentage < 100 ? "bg-green-600" : "bg-red-600"
  const percentageWidth = parcelPercentage + "%"

  var weightPercentage = getCompletionPercentage(totalWeight, PARCEL_WEIGHT_LIMIT_IN_BAG)
  weightPercentage = weightPercentage >= 100 ? 100 : weightPercentage
  const fillClassWeight = weightPercentage < 100 ? "bg-green-600" : "bg-red-600"
  const weightPercentageWidth = weightPercentage + "%"


  return (
    <div className="cell-container">
      <div className="cell-content">
        <div>Numero pacchi: {numItems}</div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4 dark:bg-gray-700">
          <div className={`${fillClassParcel} h-1.5 rounded-full`} style={{ width: percentageWidth }}></div>
        </div>
        <div>Peso: {round(totalWeight)}kg</div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4 dark:bg-gray-700">
          <div className={`${fillClassWeight} h-1.5 rounded-full`} style={{ width: weightPercentageWidth }}></div>
        </div>
      </div>
    </div>
  );
};


const Grid = ({ cellToHighlight, bags }: any) => {

  // Define the rows and columns based on the array
  const rows = ['A', 'B', 'C'];
  const columns = [1, 2];

  const mapping: Record<string, string> = {
    "A1": "1",
    "A2": "2",
    "B1": "3",
    "B2": "4",
    "C1": "5",
    "C2": "6",
  }


  console.log(cellToHighlight)

  return (
    <table className="grid-table">
      <tbody>
        {rows.map(row => (
          <tr key={row}>
            {columns.map(col => {
              const cellKey = `${row}${col}`;
              const bagindex = mapping[cellKey]
              const filteredBags = bags.filter((bag: any) => bag.id == bagindex)
              var bag = null
              if (filteredBags.length > 0) {
                bag = filteredBags[0]
              }

              return (
                <td
                  key={cellKey}
                  className={
                    cellKey == cellToHighlight ? 'filling-cell' : ""
                  }
                >
                  {bag && <Cell
                    numItems={bag.num_parcels}
                    totalWeight={bag.weight_tot}
                  />
                  }
                  {/* {closedMap[cellKey] ? 'closed' :
                    fillingMap[cellKey] ? 'filling' :
                      emptyMap[cellKey] ? 'empty' : 'N/A'} */}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};


const Home: FC = () => {

  const [ldv, setLdv] = useState<any>("");
  const [bag, setBag] = useState<any>("");
  const [anag, setAnag] = useState<any>(null);
  const [ts, setTs] = useState<any>("");
  const [parcelCompliance, setParcelCompliance] = useState<boolean>(true);
  const [parcelComplianceDescription, setParcelComplianceDescription] = useState<string>("");
  const [bagsData, setBagsData] = useState<any>([]);
  const [alarm, setAlarm] = useState<Blob>();

  function formatDate(datestr: any) {
    const date = new Date(datestr);
    var hours = date.getHours();
    var minutes = date.getMinutes().toString();
    var seconds = date.getSeconds().toString();
    if (parseInt(seconds) < 10) {
      seconds = "0" + seconds
    }
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = parseInt(minutes) < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ':' + seconds + " " + ampm;
    return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + strTime;
  }

  function updateUi(event: any) {
    setAlarm(new Blob())
    if (!event.data.parcel_compliance) {
      console.log("no compliance parcel", event.data.receiver)
      setAnag(event.data.receiver)
    } else {
      fetchParcel(event.data.parcel.ldv.id)
    }
    setBag(event.bag_id);
    setLdv(event.data.parcel.ldv.id);
    setTs(event.data.timestamp);
    setParcelCompliance(event.data.parcel_compliance)
    setParcelComplianceDescription(event.data.parcel_compliance_description)

    fetchBags()

    checkBagsAlarms()

  }

  async function fetchBags() {

    const url = `https://ou8s3gknh3.execute-api.eu-central-1.amazonaws.com/dev/v1/demoai/bags/stats`

    return await fetch(url).then(response => response.json())
      .then(data => setBagsData(data))

  }

  async function fetchParcel(ldv: string) {

    const url = `https://ou8s3gknh3.execute-api.eu-central-1.amazonaws.com/dev/v1/demoai/parcel/${ldv}`

    return await fetch(url).then(response => response.json())
      .then(data => setAnag(data.receiver))

  }

  async function checkBagsAlarms() {
    // check if an alarm needs to be raised
    async function generateAlarm(text: string, callback: Function) {
      const audioFromText = await callTextToSpeectApi(text)

      callback(audioFromText)
    };

    console.log("current bag: ", bag)
    const filteredBag = bagsData.filter((bagitem: any) => bagitem.id === bag)
    console.log("filtered bags: ", filteredBag)
    if (filteredBag.length > 0) {
      var alarmText = ""
      if (filteredBag[0].num_parcels > PARCELS_LIMIT_IN_BAG) {
        alarmText = `Bag numero ${filteredBag[0].id} è piena. `
      }

      if (filteredBag[0].weight_tot > PARCEL_WEIGHT_LIMIT_IN_BAG) {
        alarmText += `Bag numero ${filteredBag[0].id} è troppo pesante. `
      }

      if (alarmText != "") {
        generateAlarm(alarmText, setAlarm)
      }
    }
  }

  useEffect(() => {
    fetchBags()
  }, []);

  useEffect(() => {
    checkBagsAlarms()
  }, [bag]);

  // useEffect(() => {

  //   if (ldv) {
  //     setAlarm(new Blob())
  //     console.log("new LDV is coming...", ldv)
  //     if (!parcelCompliance) {
  //       fetchParcel(ldv)
  //     }

  //     fetchBags()

  //     checkBagsAlarms()

  //   }

  // }, [ldv]);

  const cells = ["A1", "A2", "B1", "B2", "C1", "C2"]

  const cellToHighlight = cells[bag - 1]

  return (
    <>
      <section>
        <div className="flex flex-row space-y-16">
          <div className="basis-2/3">
            <div className="hero min-h-[calc(50vh-64px)] bg-base-200">
              {ldv &&
                <div className="flex flex-col space-y-16">
                  <div>
                    {!parcelCompliance &&
                      <div className="bg-base-400 grid justify-items-center">
                        <p className="text-red-500 text-5xl">{parcelComplianceDescription}</p>
                      </div>
                    }
                  </div>
                  <div>
                    <p className="text-3xl  text-center">{formatDate(ts)}</p>
                  </div>
                  <div className={`flex flex-row`}>
                    <div className="basis-1/3">
                      <p className="text-2xl  text-center">LDV</p>
                      <p className="text-6xl text-left">{ldv}</p>
                    </div>
                    <div className="basis-1/3">
                      <p className="text-2xl text-center">Bag #</p>
                      <p className="text-8xl text-center">{bag}</p>
                    </div>
                    <div className="basis-1/3">
                      <p className="text-2xl  text-center">Dati Destinatario</p>
                      {anag &&
                        <>
                          <p className="text-4xl text-right">{anag.name}</p>
                          <p className="text-3xl text-right">{anag.address}, {anag.zipcode} {anag.city} {anag.nation}</p>
                        </>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
            <div className="bg-base-400 grid justify-items-center">
              {ldv && <ParcelStatus ldv={ldv} />}
            </div>
            <div className="bg-base-400 grid justify-items-center">

              {ldv && <img className={"reducedimg"} src={`https://openai-zebra-uploads.s3.eu-central-1.amazonaws.com/${ldv}.png`} />}


              {/* <table className="table-fixed">
                <thead>
                  {scannedLdvs.length > 0 &&

                    <tr>
                      <th>LDV</th>
                      <th>Bag #</th>
                      <th>Timestamp</th>
                    </tr>

                  }
                </thead>
                <tbody>
                  {sortedOldLdvs.length > 1 && sortedOldLdvs.reverse().slice(1, 10).map((prev: any) => (

                    <tr className={`${prev.amazonBox ? '' : 'text-red-500'}`}>
                      <th>{prev.ldv}</th>
                      <th>{prev.bag}</th>
                      <th>{formatDate(prev.ts)}</th>
                    </tr>

                  ))
                  }
                </tbody>
              </table> */}
            </div>
          </div>
          <div className="basis-1/3">
            <Grid
              cellToHighlight={cellToHighlight}
              bags={bagsData}
            />
          </div>
        </div>
        {alarm && <AudioPlayer blob={alarm} isHidden={true} />}
        <WebSocketConnect
          subcriptionKey={"parcel_scan_received#*"}

          onMessageReceived={(event) => {
            const subscriptionkey = event.event_type + "#*"
            if (subscriptionkey == "parcel_scan_received#*") {
              console.log(event)
              updateUi(event);
            }
          }}
        />
      </section>
    </>
  );
};

export default Home;


