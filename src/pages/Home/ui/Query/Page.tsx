// import WebSocketConnect from "@/websocket/Websocket";
import { FC, useEffect, useState } from "react";
// import { AudioRecorder } from 'react-audio-voice-recorder';
import { Chat } from "../Chat/Chat";

import { BarChart, Bar, ResponsiveContainer, XAxis, LineChart, Line, Tooltip, YAxis } from 'recharts';
import { ChartCard, convertTime } from "../Common";


function Charts() {

  const [zipcodeStats, setZipcodeStats] = useState<any>([]);
  const [timeStats, setTimeStats] = useState<any>([]);
  const [avgTime, setAvgTime] = useState<any>(null);

  async function fetchZipcodeStats() {

    const url = `https://ou8s3gknh3.execute-api.eu-central-1.amazonaws.com/dev/v1/demoai/parcels/stats_by_zip_code`

    return await fetch(url).then(response => response.json())
      // 4. Setting *dogImage* to the image url that we received from the response above
      .then(data => setZipcodeStats(data))

  }

  async function fetchByTimeStats() {

    const url = `https://ou8s3gknh3.execute-api.eu-central-1.amazonaws.com/dev/v1/demoai/parcels/stats_by_time`

    return await fetch(url).then(response => response.json())
      // 4. Setting *dogImage* to the image url that we received from the response above
      .then(data => {
        setTimeStats(data.stats)
        setAvgTime(data.avg_time)
      })

  }

  useEffect(() => {
    fetchZipcodeStats()
    fetchByTimeStats()
  }, []);

  let containerProps: any = {};
  containerProps['width'] = 700; // some default values
  containerProps['aspect'] = 3;


  return (
    <div className="bg-base-400 grid justify-items-cente-r w-full">
      <div className="flex flex-row min-h-300">
        <ChartCard title={"Numero pacchi/Area"}>
          <ResponsiveContainer {...containerProps}>
            <BarChart width={150} height={40} data={zipcodeStats}>
              <XAxis dataKey="name" />
              <YAxis orientation="left" />
              <Bar dataKey="num_parcels" fill="#8884d8" />
              <Tooltip />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="flex flex-row min-h-300">
        <div>
          <ChartCard title={"Numero pacchi lavorati/minuto"}>
            <ResponsiveContainer width="100%" height="100%"  {...containerProps}>
              <LineChart width={300} height={100} data={timeStats}>
                <XAxis dataKey="name" />
                <YAxis orientation="left" />
                <Line type="monotone" dataKey="num_parcels" stroke="#8884d8" strokeWidth={2} />
                <Tooltip />

              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="content-center justify-center justify-items-center">
          <span>tempo medio elaborazione pacco</span>
          <p className="text-9xl justify-center ">{convertTime(avgTime)}</p>
        </div>
      </div>
      <br />

    </div>
  );
}



const Query: FC = () => {

  return (
    <>
      <section>

        <div className="hero min-h-[calc(50vh-64px)] bg-base-200">
          <Charts />
        </div>
        <div>
          <Chat />
        </div>
        {/* <div className="bg-base-400 grid justify-items-center">
          <table className="table-fixed">
            <thead>
              {oldLdvs &&

                <tr>
                  <th>LDV</th>
                  <th>Bag #</th>
                  <th>Timestamp</th>
                </tr>

              }
            </thead>
            <tbody>
              {sortedOldLdvs.length > 1 && sortedOldLdvs.reverse().slice(1, 10).map((prev: any) => (

                <tr>
                  <th>{prev.ldv}</th>
                  <th>{prev.bag}</th>
                  <th>{formatDate(prev.ts)}</th>
                </tr>

              ))
              }
            </tbody>
          </table>
        </div> */}
        {/* <WebSocketConnect
          subcriptionKey={"parcel_scan_received#*"}

          onMessageReceived={(event) => {
            console.log(event)
            updateUi(event);
          }}
        /> */}
      </section>
    </>
  );
};

export default Query;


