// appwrite.js
const appwrite = require("appwrite");

const client = new appwrite.Client()
    .setEndpoint('https://[https://cloud.appwriteio/console/project-565656]') // Your Appwrite endpoint
    .setProject('[457493373034-34kor1bgs8r8sj2rf8k12ff4r9cdpf7m.apps.googleusercontent.com]'); // Your Appwrite project ID

const account = new appwrite.Account(client);

module.exports = { account };
