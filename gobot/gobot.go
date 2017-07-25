package main

import (
    "log"
    "os"
    "net/http"
    "encoding/json"
    "golang.org/x/net/websocket"
)

type SlackAuthResponse struct{
    Ok bool
    Url string
    Team map[string]*string
}


const slackRtmAuthorize = "https://slack.com/api/rtm.connect"

func main() {
    /*
    handshake to slack
    get websocket going
    parse messages directed at bot
    send repsonses based on regex
    */
    client := &http.Client{}
    request, err := http.NewRequest("GET", slackRtmAuthorize, nil)
    if (err != nil) {
	log.Fatal("Could create request", err)    
    }
    query := request.URL.Query()
    query.Add("token", os.Getenv("TOKEN"))
    request.URL.RawQuery = query.Encode()
    response, err := client.Do(request)
    if (err != nil) {
        log.Fatal("Failed to get websocket", err)
    }
    defer response.Body.Close()
    var slackAuthResponse SlackAuthResponse
    decoder := json.NewDecoder(response.Body)
    err = decoder.Decode(&slackAuthResponse)
    if (err != nil) {
        log.Fatal("Failure decoding JSON")
    }
    websocketUrl := slackAuthResponse.Url
    log.Printf("Websocket: %s", websocketUrl)

    ws, err := websocket.Dial(websocketUrl, "", "http://localhost")
    if (err != nil) {
        log.Fatal("Failed opening websocket", err)
    }
    ws.Write([]byte("Hello, This is gobot!\n"));
    
}
