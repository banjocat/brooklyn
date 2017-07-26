package main

import (
    "log"
    "os"
    "net/http"
    "encoding/json"
    "strings"
    "github.com/gorilla/websocket"
    "io/ioutil"
    "regexp"
)

type SlackAuthResponse struct{
    Ok bool		`json:"ok"`
    Url string		`json:"url"`
    Team interface{}	`json:"team"`
    Self map[string]string `json:"self"`
    Error string	`json:"error"`
}

type SlackMessage struct{
    Id int	    `json:"id"`
    Type string	    `json:"type"`
    Channel string  `json:"channel"`
    Text string	    `json:"text"`
}

type Config struct{
    Conversation map[string]string
}

func init() {
    log.SetFlags(log.LstdFlags | log.Lshortfile)
}

func main() {
    /*
    handshake to slack
    get websocket going
    parse messages directed at bot
    send repsonses based on regex
    */
    websocketUrl, botId, err := getSocketUrlAndBotId()
    if (err != nil) {
	log.Fatal(err)
    }
    conn, _, err := websocket.DefaultDialer.Dial(websocketUrl, nil)
    if (err != nil) {
	log.Fatal(err)
    }
    config, err := getConfig()
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
	ok, eventChannel, eventMessage := validEvent(message, botId)
	if !ok {
	    continue
	}
	log.Printf("recv: %s", message)
	messageToSend := determineMessage(eventMessage, config)
	if messageToSend == ""{
	    continue
	}
	slackMessage := SlackMessage{
	    Id: 1,
	    Type: "message",
	    Channel: eventChannel,
	    Text: messageToSend,
	}
	slackMessageJson, err := json.Marshal(slackMessage)
	log.Printf("sending: %s", slackMessageJson)
	conn.WriteMessage(websocket.TextMessage, slackMessageJson)
    }
    defer conn.Close()
}

func getConfig() (Config, error) {
    configJson, err := ioutil.ReadFile("./config.json")
    var config Config
    err = json.Unmarshal(configJson, &config)
    return config, err
}

func getSocketUrlAndBotId() (string, string, error) {
    const slackRtmAuthorize = "https://slack.com/api/rtm.connect"
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
    ok := slackAuthResponse.Ok
    if !ok {
	log.Fatal(slackAuthResponse.Error)
    }

    websocketUrl := slackAuthResponse.Url
    botId := slackAuthResponse.Self["id"]
    log.Printf("Ok: %s, Websocket: %s, botId: %s", ok, websocketUrl, botId)
    return websocketUrl, botId, nil
}

func validEvent(message []byte, botId string) (bool, string, string) {
    var event map[string]interface{}
    err := json.Unmarshal(message, &event)
    if (err != nil) {
	log.Println(err)
	return false, "", ""
    }
    eventTypeInterface, ok := event["type"]
    if !ok {
	return false, "", ""
    }
    eventType := eventTypeInterface.(string)
    if eventType != "message" {
	return false, "", ""
    }
    eventMessage := event["text"].(string)
    if !strings.Contains(eventMessage, botId) {
	return false, "", ""
    }
    user := event["user"].(string)
    if user == botId {
	return false, "", ""
    }
    eventChannel := event["channel"].(string)
    return true, eventChannel, eventMessage
}

func determineMessage(eventMessage string, config Config) (string) {
    for k, v := range config.Conversation {
	log.Printf("k: %s v: %s", k, v)
	reg := "(?i)" + k // Make it case insenstive
	matched, err := regexp.Match(reg, []byte(eventMessage))
	if (err != nil) {
	    log.Print(err)
	    return ""
	}
	if matched {
	    return v
	}
    }
    return ""
}

