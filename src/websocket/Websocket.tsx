import { Fragment, ReactElement, useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

export type WebSocketConnectProps = {
    //   connectionId: string;
    subcriptionKey: string;
    // subscribe: () => void;
    // unsubscribe: () => void;
    sendMessage: boolean;
    // message: any;
    onMessageSent: () => void;
    onReadyStateChange: (readyState: ReadyState) => void;
    onMessageReceived: (response: any) => void;
};

const WebSocketConnect = (props: WebSocketConnectProps): ReactElement<any> => {
    const [connect] = useState(true);
    const [sendMessage, setSendMessage] = useState(props.sendMessage);

    const websocketService = useWebSocket(
        "wss://ae80xap7e0.execute-api.eu-central-1.amazonaws.com/dev/",
        {
            onOpen: () => console.log("Connection Opened"),
            onClose: () => console.log("Websocket Connection Closed"),
            onError: (event: any) => console.log(event),
            onMessage: (event: any) => {
                const response = JSON.parse(event.data);
                console.log("Websocket Response: " + response);
                props.onMessageReceived(response);
            },
            share: true,
            //   queryParams: { connectionId: props.connectionId },
            //Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: (_closeEvent) => true,
            reconnectAttempts: 10,
            reconnectInterval: 3000
        },
        connect
    );

    useEffect(() => {
        console.log(
            `The WebSocket current status is:  ${ReadyState[websocketService.readyState]
            }`
        );
        if (ReadyState.OPEN == websocketService.readyState) {
            if (props.subcriptionKey != null) {
                subscribe(props.subcriptionKey);
            }

        }
    }, [websocketService.readyState]);

    useEffect(() => {
        if (props.sendMessage !== sendMessage) {
            setSendMessage(props.sendMessage);
        }
    }, [props.sendMessage, sendMessage]);

    // useEffect(() => {
    //     return () => unsubscribe(props.subcriptionKey);
    // }, [props.subcriptionKey]);

    // useEffect(() => {
    //     if (props.sendMessage && props.message) {
    //         websocketService.sendJsonMessage(props.message);
    //         props.onMessageSent();
    //     }
    // }, [props, props.message, props.sendMessage, websocketService]);

    const subscribe = function (subscriptionKey: string) {
        const payload = {
            action: "subscribe",
            subscription_key: subscriptionKey
        }
        websocketService.sendJsonMessage(payload);
    }

    // const unsubscribe = function (subscriptionKey: string) {
    //     const payload = {
    //         action: "unsubscribe",
    //         subscription_key: subscriptionKey
    //     }
    //     websocketService.sendJsonMessage(payload);
    // }

    return <Fragment />;
};

WebSocketConnect.defaultProps = {
    connectionId: undefined,
    resourceUrl: "",
    sendMessage: true,
    // message: undefined,
    // subscribe: () => { },
    // unsubscribe: () => { },
    onMessageSent: () => { },
    onReadyStateChange: () => { },
    onMessageReceived: () => { }
};

export default WebSocketConnect;
