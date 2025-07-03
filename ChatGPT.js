const express = require("express");
const router = express.Router();
const { isValidRequest, postChatGPTMessage } = require("./ChatGPTUtil");

router.post("/", async (req, res) => {
    console.log("Received request body:", req.body);

    const validationResult = isValidRequest(req.body);
    if (!validationResult.isValid) {
        return res.status(400).json({ error: "Invalid request", details: validationResult.error });
    }

    const chatGPTResponse = await postChatGPTMessage(req.body);

    if (!chatGPTResponse.error) {
        console.log("Success response from ChatGPT:", chatGPTResponse);
        return res.status(200).json(chatGPTResponse);
    } else {
        console.error("Error with ChatGPT API:", chatGPTResponse.details);
        return res.status(500).json({ error: "Error with ChatGPT", details: chatGPTResponse.details });
    }
});

module.exports = router;
