package main

import (
    "log"
    "os"
    "net/http"
)

const slackRtmAuthorize = "https://slack.com/api/rtm.connect"

func main() {
    /*
    handshake to slack
    get websocket going
    parse messages directed at bot
    send repsonses based on regex
    */
    request, err := http.NewRequest("GET", slackRtmAuthorize, nil)
    if (err != nil) {
	log.Fatal("Could create request")    
    }
    query := request.URL.Query()
    query.Add("client_id", os.Getenv("CLIENT_ID"))
    query.Add("scope", "channels:read,channels:write")
    request.URL.RawQuery = query.Encode()
}
