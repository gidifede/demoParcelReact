import { useEffect, useState } from "react";
import { AudioPlayer, callOpenAi, callTextToSpeectApi, speechToText } from "../Common";
import { AudioRecorder } from "react-audio-voice-recorder";

function AIMessage({ data }: any) {

    var content = null
    if (data.type == "text") {

        content = data.data
    }
    if (data.type == "ldv") {
        content = data.data.map((ldv: any) =>
            <>
                <span>{ldv}</span>
                <img className={"imgsmall"} src={`https://openai-zebra-uploads.s3.eu-central-1.amazonaws.com/${ldv}.png`} />
            </>
        )
    }

    return (
        <div className="flex gap-3 my-4 text-gray-600 text-sm flex-1">
            <span
                className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                <div className="rounded-full bg-gray-100 border p-1"><svg stroke="none" fill="black" strokeWidth="1.5"
                    viewBox="0 0 24 24" aria-hidden="true" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z">
                    </path>
                </svg>
                </div>
            </span>
            <p className="leading-relaxed rounded-lg bg-gray-200 p-3">
                <span className="block font-bold text-gray-700">AI </span>
                {content}
            </p>
        </div>
    )
}

function UserMessage({ message }: any) {
    return (
        <div className="flex flex-row-reverse gap-3 my-4 text-gray-600 text-sm flex-1">
            <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                <div className="rounded-full bg-gray-100 border p-1"><svg stroke="none" fill="black" strokeWidth="0"
                    viewBox="0 0 16 16" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z">
                    </path>
                </svg></div>
            </span>
            <p className="leading-relaxed text-right rounded-lg bg-sky-700 p-3">
                <span className="block font-bold text-gray-100">You </span>
                <span className="block text-gray-300">{message}</span>
            </p>
        </div>
    )
}



export function Chat() {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [messages, setMessages] = useState<any>([]);
    const [userInput, setUserInput] = useState<string>("");
    const [aiResponseAudio, setAiResponseAudio] = useState<Blob>();

    useEffect(() => {
        // to prevent repeating audio while user is writing
        setAiResponseAudio(new Blob())
    }, [userInput]);

    async function sendAudioElement(blob: Blob) {
        await speechToText(blob, sendUserMessage)

        // if (audioText == "") {
        //     setUserMessage("errore durante il riconoscimento vocal, riprovare")
        // }

        // sendUserMessage(audioText)

    };

    function toggleChat() {
        if (!isOpen) {
            setMessages([])
            setAiMessage({ type: "text", data: "Ciao, posso aiutarti?" })
        }
        setIsOpen(!isOpen)
    }

    function submitUserMessage(event: any) {
        event.preventDefault()
        sendUserMessage(userInput, false)
        setUserInput("")
    }
    async function sendUserMessage(text: string, messageFromAudio: boolean) {
        setUserMessage(text)

        const openaiResp = await callOpenAi(text)

        console.log("AI resp", openaiResp)
        const openAiJsonResponse = JSON.parse(openaiResp["response"])

        setAiMessage(openAiJsonResponse)

        console.log("check if convert text to speech...", openAiJsonResponse["type"], messageFromAudio)
        if (openAiJsonResponse["type"] == "text" && messageFromAudio) {
            console.log("generating ai reponse from text...")
            const audioFromText = await callTextToSpeectApi(openAiJsonResponse["data"])
            setAiResponseAudio(audioFromText)
        } else {
            setAiResponseAudio(new Blob())
        }

    }

    function setUserMessage(text: string) {
        const item = {
            timestamp: new Date(),
            type: "user",
            content: text
        }
        setMessages((prev: any) => [...prev, item])
    }

    function setAiMessage(data: any) {

        var aiText = ""
        if (data.data instanceof Object) {
            for (var key of Object.keys(data.data)) {
                aiText += key + ": " + data.data[key] + "\n"
            }
        } else {
            aiText = data.data
        }

        const item = {
            timestamp: new Date(),
            type: "ai",
            content: { type: data.type, data: aiText }
        }
        setMessages((prev: any) => [...prev, item])
    }

    var classOpenchat = isOpen ? "opacity-100 " : "opacity-0 "
    classOpenchat += "transition-opacity ease-in-out delay-150 duration-300 pt-4 text-sm text-red-500 font-['Poppins'] font-bold "

    return (
        <>
            <button
                onClick={() => toggleChat()}
                className="fixed bottom-4 right-4 inline-flex items-center justify-center text-sm font-medium disabled:pointer-events-none disabled:opacity-50 border rounded-full w-16 h-16 bg-black hover:bg-gray-700 m-0 cursor-pointer border-gray-200 bg-none p-0 normal-case leading-5 hover:text-gray-900"
                type="button" aria-haspopup="dialog" aria-expanded="false" data-state="closed">
                <svg xmlns=" http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="text-white block border-gray-200 align-middle">
                    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" className="border-gray-200">
                    </path>
                </svg>
            </button>


            {isOpen && <div style={{ boxShadow: "0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05);" }}
                className={`${classOpenchat} fixed bottom-[calc(4rem+1.5rem)] right-0 mr-4 bg-white p-6 rounded-lg border border-[#e5e7eb] w-[440px] h-[634px]`}>

                <div className="flex flex-col space-y-1.5 pb-6">
                    <h2 className="font-semibold text-lg tracking-tight">Chatbot</h2>
                    <p className="text-sm text-[#6b7280] leading-3">Powered by Logistic team</p>
                </div>

                <div className="overflow-y-auto pr-4 h-[474px]" >
                    {/* <!-- Chat Message AI --> */}

                    {
                        messages.map((message: any) => {
                            if (message.type == "ai") {
                                return <AIMessage data={message.content} />
                            }
                            if (message.type == "user") {
                                return <UserMessage message={message.content} />
                            }
                        })
                    }

                    {/* <AIMessage data={{ type: "text", data: "Ciao, posso aiutarti?" }} /> */}

                    {/* <!--  User Chat Message --> */}
                    {/* <UserMessage message={"No"} /> */}

                </div>
                {/* <!-- Input box  --> */}
                <div className="flex items-center pt-0">
                    <form className="flex items-center justify-center w-full space-x-4">
                        <AudioRecorder
                            onRecordingComplete={sendAudioElement}
                            audioTrackConstraints={{
                                noiseSuppression: true,
                                echoCancellation: true,
                                // autoGainControl,
                                // channelCount,
                                // deviceId,
                                // groupId,
                                // sampleRate,
                                // sampleSize,
                            }}
                            onNotAllowedOrFound={(err) => console.table(err)}
                            downloadOnSavePress={false}
                            downloadFileExtension="wav"
                            mediaRecorderOptions={{
                                audioBitsPerSecond: 128000,
                            }}
                            showVisualizer={true}
                        />
                        <input
                            className="flex h-10 rounded-md border border-[#e5e7eb] px-3 py-2 text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-50 text-[#030712] focus-visible:ring-offset-2"
                            placeholder="Invia una domanda"
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                        />
                        <button
                            onClick={submitUserMessage}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium text-[#f9fafb] disabled:pointer-events-none disabled:opacity-50 bg-black hover:bg-[#111827E6] h-10 px-4 py-2">
                            Invia</button>


                    </form>
                </div>

            </div >
            }
            {aiResponseAudio && <AudioPlayer blob={aiResponseAudio} isHidden={true} />}
        </>
    )
}