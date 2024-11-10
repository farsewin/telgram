const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Replace with your Firebase service account path
const serviceAccount = require('sdk.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'docbot-ec9c8.firebasestorage.app'
});

const token = '7526602011:AAGGozJdw4f3_PuC1W3UYTor3ybOCbooR3I';
const bot = new TelegramBot(token, { polling: true });

// Handle the /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to the printing service bot! Please send me your document for printing.');
});

// Handle document uploads
bot.on('document', (msg) => {
    const chatId = msg.chat.id;
    const fileId = msg.document.file_id;
    
    // Get the file URL from Telegram API
    bot.getFileLink(fileId).then((fileLink) => {
        console.log('Document link:', fileLink);

        // Send to Firebase for storage or processing
        const bucket = admin.storage().bucket();
        const file = bucket.file(msg.document.file_name);
        const fileStream = file.createWriteStream();

        fetch(fileLink)
            .then((res) => res.body.pipe(fileStream))
            .then(() => {
                bot.sendMessage(chatId, 'Your document has been successfully uploaded for printing!');
            })
            .catch((err) => {
                console.error('Error uploading file:', err);
                bot.sendMessage(chatId, 'There was an error with your document upload. Please try again.');
            });
    });
});

// Handle any other incoming message
bot.on('message', (msg) => {
    console.log('Received message:', msg.text);
});
