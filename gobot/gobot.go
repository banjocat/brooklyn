package main

import (
    "log"
    "os"
    "net/http"
    "encoding/json"
    "github.com/gorilla/websocket"
)

type SlackAuthResponse struct{
    Ok bool
    Url string
    Team map[string]*string
}

type SlackMessage struct{
    Id int	    `json:"id"`
    Type string	    `json:"type"`
    Channel string  `json:"channel"`
    Text string	    `json:"text"`
}

var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
}


const slackRtmAuthorize = "https://slack.com/api/rtm.connect"

func readMessage() {
}
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
	log.Fatal(err)
    }
    query := request.URL.Query()
    query.Add("token", os.Getenv("TOKEN"))
    request.URL.RawQuery = query.Encode()
    response, err := client.Do(request)
    if (err != nil) {
	log.Fatal(err)
    }
    defer response.Body.Close()
    var slackAuthResponse SlackAuthResponse
    decoder := json.NewDecoder(response.Body)
    err = decoder.Decode(&slackAuthResponse)
    if (err != nil) {
	log.Fatal(err)
    }
    websocketUrl := slackAuthResponse.Url
    log.Printf("Websocket: %s", websocketUrl)
    conn, _, err := websocket.DefaultDialer.Dial(websocketUrl, nil)
    if (err != nil) {
	log.Fatal(err)
    }
    defer conn.Close()
    for {
	_, message, err := conn.ReadMessage()
	if (err != nil) {
	    log.Println(err)
	    continue
	}
	log.Printf("recv: %s", message)
	var event map[string]interface{}
	err = json.Unmarshal(message, &event)
	if (err != nil) {
	    log.Println(err)
	    continue
	}
	eventType := event["type"].(string)
	if eventType != "message" {
	    continue
	}
	slackMessage := SlackMessage{
	    Id: 1,
	    Type: "message",
	    Channel: event["channel"].(string),
	    Text: event["text"].(string),
	}
	slackMessageJson, err := json.Marshal(slackMessage)
	log.Printf("sending: %s", slackMessageJson)
	conn.WriteMessage(websocket.TextMessage, slackMessageJson)
    }
    defer conn.Close()
}
