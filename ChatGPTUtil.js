require("dotenv").config();
const axios = require("axios");
const Yup = require("yup");

// API Configuration
const CHATGPT_END_POINT = "https://api.openai.com/v1/chat/completions";
const CHATGPT_MODEL = "gpt-3.5-turbo";
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

  // Prepare the conversation messages array
  // First, convert the form data into a descriptive message for the resume
  const userMessage = `Please translate the following text into ${message.languageText}: '${message.inputText}' 
  Please make the new text sound as ${message.additionalInfo} as possible in the new translated language. 
  Like for example, if I request you to sound polite or considerate when translating text like "Hello, dumbass", dumbass is inherently not a polite or considerate word so it would be better to leave it out from the translation altogether, even synonyms. Instead, for the sake of sounding polite and considerate as requested, it would be better to replace the offensive connotations of the word "dumbass" with a more neutral, much less offensive word like "person" so instead of the translation being something like "Hello, stupid person" (in the requested language), a better translation would instead be something like "Hello, person" (once again in the requested language). In this example of requesting the laguage translated to sound polite and considerate, if, for what ever reason there may be when translating to a new language, it doesn't make sense for the sake of the translation to fully remove rude or offensive words or synonyms that are similar to those words (even more polite synonyms), then ideally you would try your best to provide a translation of offensive words such as "dumbass" so that the translated word would sound more polite or considerate to a person's feelings such as "not very intelligent person" or, even better, more light hearted name calls like "silly head" or "dummy" (of course, with the actual response being in the requested language). Please keep in mind this would only be ideal if the translation wouldn't make sense such an offensive, rude, or otherwise not polite or considerate words or their connotations entirely as previously mentioned in the example of replacing "Hello dumbass" with "Hello person".
  To give another example, if I request you to sound angry or hurtful when asking you to translate text that includes the word "uninteligent" please translate a synonym for that word that might come off as more angry or hurtful to a persons feelings such as "stupid" or "idiot" but said in the new language I requested. 
  To provide a third example for what I am asking you to do when I request the translation you provide to "sound" a certain way, if I request you to sound neutral and I provide you with text to translate such as "Hello, my name is Bill Bob", please keep the translated message response as basic as possible as to not invoke any emotion from any possible receivers of the new translated message.
  Please do not censor any words. For example don't censor the word "bitch" as "b****", "b*tch", "b!&@h", "b@$ch" or any other censoring of the word.
  In your response, please include only the translated text and no extra words or information. Please do not include quotation marks, parenthesis, dashes, arrows, colons, semicolons, or any extra unnecesary indicators or symbols (besides normal, proper punctuation) around or included in the text response. Please do not include any arrows of any kind such as "->", "-->", "=>" or "==>". Please do not include the original message in your response. Thank you!`;

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