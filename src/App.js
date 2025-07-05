import React, { useState } from 'react';
import './App.css';

function App() {
  // State for managing input text
  const [inputText, setInputText] = useState('');

  // State for language information
  const [languageText, setLanguageText] = useState('');

  // State for additional information
  const [additionalInfo, setAdditionalInfo] = useState('');

  // State for managing translated text
  const [translatedText, setTranslatedText] = useState('');

  // Create a state variable for the text to translate.
  const [translationInformation, setTranslationInformation] = useState({
    inputText: "",
    languageText: "",
    additionalInfo: "",
  });

  // State for managing which face image to show
  const [faceImage, setFaceImage] = useState("/faces/Resting.png");

  // Function to handle input text change
  const handleInputChange = (event) => {
    const fieldName = event.target.name;
    let value = event.target.value;
    setInputText(value);
    setTranslationInformation((currData) => ({ ...currData, [fieldName]: value }));
  };

  // Function to handle language text change
  const handleLanguageChange = (event) => {
    const fieldName = event.target.name;
    let value = event.target.value;
    setLanguageText(value);
    setTranslationInformation((currData) => ({ ...currData, [fieldName]: value }));
  };

  // Function to handle additional info change
  const handleAdditionalInfoChange = (event) => {
    const fieldName = event.target.name;
    let value = event.target.value;
    setAdditionalInfo(value);
    setTranslationInformation((currData) => ({ ...currData, [fieldName]: value }));
  };

  // ====== Transate button: ======

  // Array of translated words
  const translatedWords = ["Traducir", "Tradurre", "翻譯", "翻訳する", "Översätt", "يترجم", "přeložit", "Oversætte", "Vertalen", "Isalin", "Kääntää", "Traduire", "Übersetzen", "Μεταφράζωa", "Unuhi", "לתרגם", "अनुवाद", "fordít", "Þýða", "Menerjemahkan", "Aistrigh", "번역하다", "Орчуулах", "Oversette", "Tłumaczyć", "Traduzir", "ਅਨੁਵਾਦ", "Traduceți", "Переводить", "अनुवदति", "Eadar-theangaich", "превести", "Turjun", "Tafsiri", "แปลภาษา", "Çevirmek", "Перекласти", "ترجمہ کریں۔", "Tarjima", "Dịch", "Cyfieithwch", "איבערזעצן"];

  // State to hold the currently displayed word
  const [currentWord, setCurrentWord] = useState("Translate");

  // Function to handle button hover
  const handleHover = () => {
    // Get a random index from the translatedWords array
    const randomIndex = Math.floor(Math.random() * translatedWords.length);
    // Set the currentWord state to the randomly selected word
    setCurrentWord(translatedWords[randomIndex]);
  };

  // Function to handle mouse leave (reset text to default)
  const handleMouseLeave = () => {
    setCurrentWord("Translate");
  };

  // ====== Function to handle form submission: ======

  async function handleSubmit(event) {
    console.log(translationInformation.inputText)
    // For now, just echo the input text and additional info
    console.log("Input Text:", inputText);
    console.log("Additional Info:", additionalInfo);
    console.log("translationInformation:", translationInformation);

    event.preventDefault();
    const payload = {
      context: "You are a translation app, fluent in all languages. Your particular specialty is translating messages to come across a certain way such as sounding polite or rude in a message or any other connotation to one's speech.",
      message: translationInformation, // Ensure textToTranslate is structured as expected by the backend
      conversation: [], // If you're using this field
    };

    try {
      const response = await fetch('http://localhost:3000/chatGPT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const chatGPTResponseData = await response.json();
      console.log(chatGPTResponseData);
      console.log('TRANSLATION REQUEST SENT')
      // Update translated text
      setTranslatedText(chatGPTResponseData.message.content);

      // --- NEW LOGIC: Update face image based on emotion in response ---
      // Expecting format: "Happy translated text here"
      if (chatGPTResponseData.message && chatGPTResponseData.message.content) {
        // Extract the first word (emotion) from the response
        const match = chatGPTResponseData.message.content.match(/^(\w+)/);
        if (match) {
          const emotion = match[1].toLowerCase();
          // Map emotion to image filename (capitalize first letter)
          const emotionMap = [
            "generous", "disgusted", "embarassed", "energetic", "scared", "existential", "happy", "loving", "mad", "mischievous", "neutral", "sad", "tired", "bored", "confused", "jealous", "nervous", "relaxed", "shocked", "silly", "sympathetic"
          ];
          if (emotionMap.includes(emotion)) {
            setFaceImage(`/faces/${emotion.charAt(0).toUpperCase() + emotion.slice(1)}.png`);
            // console.log(`ALL DATA: ${JSON.stringify(chatGPTResponseData)}`);
          } else {
            console.log("Unknown emotion:", emotion);
            setFaceImage("/faces/Resting.png");
          }
        } else {
          console.log("No emotion found in response, setting to resting face.");
          setFaceImage("/faces/Resting.png");
        }
      }
      // --- END NEW LOGIC ---

    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="input-container" component="form" onSubmit={handleSubmit}>
          <label htmlFor="inputBox">What would you like to translate?</label>
          <textarea className="input-box"
            name="inputText"
            id="inputBox"
            type="text"
            value={inputText}
            required
            onChange={handleInputChange}
          />
        </div>
        <div className="language-container">
          <label htmlFor="languageBox">What lagnuage would you like to translate to?</label>
          <input
            name="languageText"
            id="languageBox"
            type="text"
            value={languageText}
            required
            onChange={handleLanguageChange}
          />
        </div>
        <div className="additional-info-container">
          <label htmlFor="additionalInfoBox">How would you like to come across?</label>
          <input
            name="additionalInfo"
            id="additionalInfoBox"
            type="text"
            value={additionalInfo}
            required
            onChange={handleAdditionalInfoChange}
          />
        </div>
        <div className="output-container">
          <label>Your translated message:</label>
          <textarea className="output-box"
            id="outputBox"
            type="text"
            value={translatedText} // Display translated text
            readOnly // Make it read-only
          />
        </div>
        {/* Button to trigger translation */}
        <button
          className="translate-button"
          onMouseEnter={handleHover}
          onMouseLeave={handleMouseLeave}
          onClick={handleSubmit} // Added onClick event handler
        >
          {currentWord}
        </button>
        <div className="face-container">
          <img className="face-image" src={faceImage} alt="Face" />
        </div>
      </header>
    </div>
  );
}

export default App;