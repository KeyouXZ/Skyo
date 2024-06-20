const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = {
	name: "gemini",
	cooldown: 10,
	usage: ["<prompt>"],
	description: "Get a Gemini result",
	run: async (client, message, args, bot) => {
        if (bot.cooldown.has(client, message)) return;

        const geminiApiKey = process.env.GOOGLE_API_KEY
        if (!geminiApiKey) return
        
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

        const prompt = args.join(" ");
        if (!prompt) return message.channel.send("You must provide a prompt");

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        if (text.length >= 2000) {
            let textToSend = "";
            for (let i = 0; i < text.length; i += 2000) {
                textToSend += text.substring(i, i + 2000);
                message.channel.send(textToSend);
                textToSend = "";
            }
        } else {
            message.channel.send(text);
        }

        bot.cooldown.set(client, message)
    }
}