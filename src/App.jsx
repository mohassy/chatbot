import { useState } from "react";
import "./App.css";
import chatGPT_Icon from "./assets/chatGPT_icon.png";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  Avatar,
  MessageGroup,
  ConversationHeader,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
function App() {
  const apiKey = import.meta.env.VITE_CHATGPT_API_KEY;
  const [messages, setMessages] = useState([
    {
      message: "Hello, how may I assist you today!",
      sender: "ChatGPT",
      direction: "incoming",
    },
  ]);
  const [typing, setTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing",
    };
    // update messages state
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    // send message to ChatGPT
    await processMessage(newMessages);
  };

  // input -> LLM output
  const processMessage = async (messages) => {
    setTyping(true);
    // map to apiMessages {role: 'user' or 'assistant', content: 'The message content'}
    let apiMessages = messages.map((message) => {
      let role = "";
      message.sender === "user" ? (role = "user") : (role = "assistant");
      return { role: role, content: message.message };
    });
    const systemMessage = {
      role: "system",
      content: "You are funny chatbot",
    };
    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json(); //convert response to json object
      })
      .then((data) => {
        return data["choices"][0]["message"]["content"];
      })
      .then(async (response) => {
        await messageToSpeech(response);
        setMessages([
          ...messages,
          {
            message: response,
            sender: "ChatGPT",
            direction: "incoming",
          },
        ]);
      })
      .catch((err) => console.error(err));
    setTyping(false);
  };

  // LLM output -> speech
  const messageToSpeech = async (message) => {
    const voiceID = "21m00Tcm4TlvDq8ikWAM";
    const modelID = "eleven_multilingual_v2";

    const body = {
      model_id: modelID,
      text: message,
      voice_settings: {
        similarity_boost: 0.3,
        stability: 0.5,
      },
    };

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceID}/stream`;
    const options = {
      method: "POST",
      headers: {
        Accept: "*/*", //accepts any format
        "xi-api-key": "ab4f428d61ba02fc84ff01f18d1c522c",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };

    await fetch(url, options)
      .then(async (response) => {
        const audioBlob = await response.blob(); // Get the audio data as a Blob
        const audioURL = URL.createObjectURL(audioBlob); // Create a URL from the Blob
        const audio = new Audio(audioURL); // Create an HTML Audio Element
        audio.play(); // Play the audio
      })
      .catch((err) => console.error(err));
  };
  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <ConversationHeader>
              <Avatar src={chatGPT_Icon} name="ChatGPT" />
              <ConversationHeader.Content userName="ChatGPT" />
            </ConversationHeader>
            <MessageList
              typingIndicator={
                typing ? <TypingIndicator content="ChatGPT is typing" /> : null
              }
            >
              {messages.map((message, i) => {
                return (
                  <MessageGroup direction={message.direction} key={i}>
                    {message.sender === "ChatGPT" ? (
                      <Avatar src={chatGPT_Icon} name={"ChatGPT"} />
                    ) : null}
                    <MessageGroup.Messages>
                      <Message key={i} model={message} />
                    </MessageGroup.Messages>
                  </MessageGroup>
                );
              })}
            </MessageList>
            <MessageInput
              placeholder="Type message here"
              onSend={handleSend}
              attachButton={false}
            />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
