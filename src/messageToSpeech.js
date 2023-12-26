const messageToSpeech = () => {
  const voiceID = "21m00Tcm4TlvDq8ikWAM";
  const modelID = "eleven_multilingual_v2";

  const body = {
    model_id: modelID,
    text: "Hello World!",
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
      "xi-api-key": import.meta.env.VITE_ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };

  fetch(url, options)
    .then((response) => response.json())
    .then((response) => console.log(response))
    .catch((err) => console.error(err));
};

export default messageToSpeech;
