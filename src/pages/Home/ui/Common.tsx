
function audioBufferToWav(buffer: any) {
    var opt: any = {}

    var numChannels = buffer.numberOfChannels
    var sampleRate = buffer.sampleRate
    var format = opt.float32 ? 3 : 1
    var bitDepth = format === 3 ? 32 : 16

    var result
    if (numChannels === 2) {
        result = interleave(buffer.getChannelData(0), buffer.getChannelData(1))
    } else {
        result = buffer.getChannelData(0)
    }

    return encodeWAV(result, format, sampleRate, numChannels, bitDepth)
}

function encodeWAV(samples: any, format: any, sampleRate: any, numChannels: any, bitDepth: any) {
    var bytesPerSample = bitDepth / 8
    var blockAlign = numChannels * bytesPerSample

    var buffer = new ArrayBuffer(44 + samples.length * bytesPerSample)
    var view = new DataView(buffer)

    /* RIFF identifier */
    writeString(view, 0, 'RIFF')
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * bytesPerSample, true)
    /* RIFF type */
    writeString(view, 8, 'WAVE')
    /* format chunk identifier */
    writeString(view, 12, 'fmt ')
    /* format chunk length */
    view.setUint32(16, 16, true)
    /* sample format (raw) */
    view.setUint16(20, format, true)
    /* channel count */
    view.setUint16(22, numChannels, true)
    /* sample rate */
    view.setUint32(24, sampleRate, true)
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * blockAlign, true)
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, blockAlign, true)
    /* bits per sample */
    view.setUint16(34, bitDepth, true)
    /* data chunk identifier */
    writeString(view, 36, 'data')
    /* data chunk length */
    view.setUint32(40, samples.length * bytesPerSample, true)
    if (format === 1) { // Raw PCM
        floatTo16BitPCM(view, 44, samples)
    } else {
        writeFloat32(view, 44, samples)
    }

    return buffer
}

function interleave(inputL: any, inputR: any) {
    var length = inputL.length + inputR.length
    var result = new Float32Array(length)

    var index = 0
    var inputIndex = 0

    while (index < length) {
        result[index++] = inputL[inputIndex]
        result[index++] = inputR[inputIndex]
        inputIndex++
    }
    return result
}

function writeFloat32(output: any, offset: any, input: any) {
    for (var i = 0; i < input.length; i++, offset += 4) {
        output.setFloat32(offset, input[i], true)
    }
}

function floatTo16BitPCM(output: any, offset: any, input: any) {
    for (var i = 0; i < input.length; i++, offset += 2) {
        var s = Math.max(-1, Math.min(1, input[i]))
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    }
}

function writeString(view: any, offset: any, string: any) {
    for (var i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
    }
}


function useObjectUrl(blob: Blob) {
    var newblob = new Blob([blob], { type: "audio/mpeg" })
    return URL.createObjectURL(newblob)
}

interface AudioPlayerProps {
    blob: Blob;
    isHidden: boolean;
}


export function AudioPlayer({ blob, isHidden }: AudioPlayerProps) {
    const src = useObjectUrl(blob);
    const classhidden = isHidden ? "audioHidden" : ""
    return <audio className={classhidden} autoPlay={true} controls {...{ src }} />;
}

export function ChartCard({ title, children }: any) {

    return (
        <div className="max-w-full w-svw p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mt-4 ml-10 mr-10">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h5>
            {children}
        </div>
    )

}

async function callTextToSpeechApi(data: any, callback: Function) {

    //const SPEECT_TO_TEXT_URL = "https://openai-sweden-test-logistic.openai.azure.com/openai/deployments/whisper/audio/transcriptions?api-version=2024-02-01"
    const SPEECT_TO_TEXT_URL = "https://westeurope.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=it-IT&format=detailed"


    console.log(data)

    var audioCtx = new window.AudioContext();

    // var arrayBuffer = null;
    var fileReader = new FileReader();
    // fileReader.onload = function (event: any) {
    //     arrayBuffer = event.target.result;
    // };
    fileReader.readAsArrayBuffer(data);
    fileReader.onloadend = async function () {
        const f: any | ArrayBuffer = fileReader.result;
        audioCtx.decodeAudioData(
            f,
            async function (buffer) {
                var wav = audioBufferToWav(buffer);
                const response = await fetch(SPEECT_TO_TEXT_URL, {
                    method: "POST",
                    body: wav,
                    headers: {
                        // "Content-Type": "audio/wav",
                        'api-key': '36b0ba357dfe4cd49a078b95d4029605',
                        "Ocp-Apim-Subscription-Key": "3d45c37ad2b84d7c9a90d9576c5ff4b7"
                    },
                })

                const r = await response.json()
                callback(r["DisplayText"], true)

            },
            function (e) { console.log(e); }
        );
    };


    return null;

}

export async function speechToText(fileobj: Blob, callback: Function): Promise<string> {

    var data = new FormData()
    data.append('file', fileobj)

    await callTextToSpeechApi(fileobj, callback)
    return "" //response["text"]

}

export async function callTextToSpeectApi(text: string) {

    console.log(text)

    // const TEXT_TO_SPEECH_URL = "https://openai-sweden-test-logistic.openai.azure.com/openai/deployments/tts/audio/speech?api-version=2024-02-15-preview"
    const TEXT_TO_SPEECH_URL = "https://westeurope.tts.speech.microsoft.com/cognitiveservices/v1"

    // const payload = {
    //     "input": text,
    //     "model": "tts",
    //     "voice": "alloy",
    //     "lamguage": "Italian"
    // }
    const payload = "<speak version='1.0' xml:lang='it-IT'><voice xml:lang='it-IT' xml:gender='Female' name='en-US-AvaMultilingualNeural'>" + text + "</voice></speak>"

    const response = await fetch(TEXT_TO_SPEECH_URL, {
        method: "POST",
        // body: JSON.stringify(payload),
        body: payload,
        headers: {
            "Content-Type": "application/ssml+xml",
            'api-key': '36b0ba357dfe4cd49a078b95d4029605',
            "Ocp-Apim-Subscription-Key": "3d45c37ad2b84d7c9a90d9576c5ff4b7",
            "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3"
        },
    })

    const resp = await response.blob();
    return resp;

}

export async function callOpenAi(text: string) {

    const OPENAI_URL = "https://flduo6wavauanqnq4f5x2nsddu0urmfq.lambda-url.eu-central-1.on.aws/"


    const payload = {
        "prompt": text
    }

    console.log(payload)
    const response = await fetch(OPENAI_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
    })

    console.log(456, response)
    const resp = await response.json();
    return resp;

}

export function convertTime(secs: any) {
    if (secs == null) return "N/A"
    var seconds = parseInt(secs, 10)
    var hours = Math.floor(seconds / 3600)
    var minutes = Math.floor((seconds - (hours * 3600)) / 60)
    var seconds = seconds - (hours * 3600) - (minutes * 60)
    if (!!hours) {
        if (!!minutes) {
            return `${hours}h ${minutes}m ${seconds}s`
        } else {
            return `${hours}h ${seconds}s`
        }
    }
    if (!!minutes) {
        return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
}    