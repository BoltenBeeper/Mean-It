require("dotenv").config();
const axios = require("axios");
const Yup = require("yup");

// API Configuration
const CHATGPT_END_POINT = "https://api.openai.com/v1/chat/completions";
const CHATGPT_MODEL = "gpt-4.1-mini";
// gpt-3.5-turbo is another good one but it's more expensive to use.

const config = {
  headers: {
    Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`,
  },
};

// Validation Schemas
const messageSchema = Yup.object().shape({
  role: Yup.string().required("Role is required."),
  content: Yup.string().required("Content is required."),
});

const requestSchema = Yup.object().shape({
  context: Yup.string().required("Context is required."),
  message: Yup.object({
    inputText: Yup.string().required(),
    languageText: Yup.string().required(),
    additionalInfo: Yup.string().notRequired(),
}).required("Message object is required."),
  conversation: Yup.array().of(messageSchema),
});

// Utility Functions
const isValidRequest = (request) => {
  try {
    requestSchema.validateSync(request);
    return { isValid: true };
  } catch (error) {
    console.error("Validation error:", error.errors);
    return { isValid: false, error: error.errors };
  }
};

const createMessage = (role, content) => ({ role, content });

const addMessageToConversation = (conversation, role, content) => {
  const message = createMessage(role, content);
  conversation.push(message);
  console.log(typeof conversation); // Should log 'object' if it's an array
console.log(Array.isArray(conversation)); // Should log 'true' if it's an array
};

const postChatGPTMessage = async (translationInformation) => {
  // Destructure textToTranslate (previously formData) to extract the context and message
  const { context, message } = translationInformation;
  emotionChoice = message.additionalInfo || "close to original text"; // Default to sound the same if not provided
  languageChoice = message.languageText || "the same language as it is written"; // Default to sound the same if not provided

  // Validate the message structure
  // if (!message || !message.inputText || !message.languageText) {
  //   throw new Error("Invalid message structure");
  // }

  // Prepare the conversation messages array
  // First, convert the form data into a descriptive message for the resume
  const userMessage = `Please translate the following text into ${languageChoice}: '${message.inputText}' 
  Please make the new text sound as ${emotionChoice} as possible in the new translated language. 
  For example, if I request you to sound polite or considerate when translating text like "Hello, dumbass", dumbass is inherently not a polite or considerate word so it would be better to leave it out from the translation altogether, even synonyms. Instead, for the sake of sounding polite and considerate as requested, it would be better to replace the offensive connotations of the word "dumbass" with a more cheerful, much less offensive word like "friend" or some other word describing a person but now with a more polite and cheerful tone. So instead of the translation being something like "Hello, stupid person" (in the requested language), a better translation would instead be something like "Hello, friend" or "Hiya buddy" (once again in the requested language). In this example of requesting the laguage translated to sound polite and considerate, if, for what ever reason there may be when translating to a new language, it doesn't make sense for the sake of the translation to fully remove rude or offensive words or synonyms that are similar to those words (even more polite synonyms), then ideally you would try your best to provide a translation of offensive words such as "dumbass" so that the translated word would sound more polite or considerate to a person's feelings such as "not very intelligent person" or, even better, more light hearted name calls like "silly head" or "dummy" (of course, with the actual response being in the requested language). Please keep in mind this would only be ideal if the translation wouldn't make sense without such offensive, rude, or otherwise not polite or considerate words. 
  To give another example, if I request you to sound angry or hurtful when asking you to translate text that includes the word "uninteligent" please translate a synonym for that word that might come off as more angry or hurtful to a persons feelings such as "stupid" or "idiot" but said in the new language I requested. 
  To provide a third example for what I am asking you to do when I request the translation you provide to "sound" a certain way, if I request you to sound neutral and I provide you with text to translate such as "Hello, my name is Bill Bob", please keep the translated message response as basic as possible as to not invoke any emotion from any possible receivers of the new translated message. 
  Please do not include the original message in your response. 
  Please do not censor any words. For example don't censor the word "bitch" as "b****", "b*tch", "b!&@h", "b@$ch" or any other censoring of the word. 
  In your response, please include only the translated text and no extra words, information, or punctuation such as quotation marks, parenthesis, dashes, arrows, colons, semicolons, or any extra unnecesary indicators or symbols (besides normal, proper punctuation) around or included in the text response. 
  Please add no extra sentences except for exactly what is needed to properly translate the exact message. For example, if I asked you to translate the sentence "hello can you help me" and ask you to sound grateful and excited" A GOOD response would be: "Hello! I would be delighted if you would help me!" and a BAD response would be: "Hello, can you please help me? I would be so incredibly grateful!" because there is no need to add extra sentences or words to the response that are not needed to properly translate the message.`;
  
  // Please give your message in the exact same format as the following example: [happy] [translated message here] (not including the brackets) where [happy] is the emotion I requested you to sound like in the new translated message (written in english) and [translated message here] is the actual translated message. 
  // Based on whichever word in the list is the closest synonym to how I asked for the translated message to sound, ONLY Replace happy with one single word from the following list (written in english): Considerate, Disgusted, Embarassed, Energetic, Fearful, Gloomy, Happy, Loving, Mad, Mischievous, Neutral, Sad, Surprised.
  // Please do not include any arrows of any kind such as "->", "-->", "=>" or "==>".

  // Construct the messages array for the API request
  const messages = [
    { role: "system", content: context },
    { role: "user", content: userMessage },
  ];

  try {
    const response = await axios.post(CHATGPT_END_POINT, { model: CHATGPT_MODEL, messages }, config);
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0]; // Assuming you want the first choice's content
    } else {
      throw new Error("Invalid response structure from OpenAI API.");
    }
  } catch (error) {
    console.error("Error with ChatGPT API:", error.response ? error.response.data : error.message);
    return { error: true, details: error.response ? error.response.data : error.message };
  }
};

module.exports = {
  isValidRequest,
  createMessage,
  addMessageToConversation,
  postChatGPTMessage,
};