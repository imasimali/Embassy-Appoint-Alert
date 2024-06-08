require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cron = require('cron');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const urlToMonitor = 'https://service2.diplo.de/rktermin/extern/choose_categoryList.do?locationCode=isla&realmId=108';
const initialContentPath = path.join(__dirname, 'initialContent.html');

const whatsappToken = process.env.WHATSAPP_TOKEN; // env config with your WhatsApp Cloud API access token
const whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_ID; // env config with your WhatsApp phone number ID
const recipientPhoneNumber = process.env.WHATSAPP_RECIPIENT_ID; // env config with the recipient's phone number

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

async function fetchPageContent(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching the URL: ${error}`);
    return null;
  }
}

async function sendWhatsAppMessage(message) {
  const url = `https://graph.facebook.com/v14.0/${whatsappPhoneNumberId}/messages`;
  const data = {
    messaging_product: 'whatsapp',
    to: recipientPhoneNumber,
    type: 'text',
    text: { body: message },
  };
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${whatsappToken}`,
  };

  try {
    const response = await axios.post(url, data, { headers });
    console.log('WhatsApp message sent:', response.data);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response ? error.response.data : error.message);
  }
}

async function sendEmailNotification(message) {
  const webhook_url = process.env.EMAIL_WEBHOOK;
  const data = {
    recipient: process.env.EMAIL_RECIPIENT,
    messageBody: message,
  };
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post(webhook_url, data, { headers });
    console.log('Email notification sent:', response.data);
  } catch (error) {
    console.error('Error sending email notification:', error.response ? error.response.data : error.message);
  }
}

async function checkForChanges() {
  const currentContent = await fetchPageContent(urlToMonitor);
  if (!currentContent) return;

  let initialContent;
  try {
    initialContent = fs.readFileSync(initialContentPath, 'utf-8');
  } catch (error) {
    console.error('Error reading initial content file:', error);
    return;
  }

  // if (currentContent !== initialContent) {
  //   console.log('Page content has changed.');
  await sendEmailNotification('The content of the monitored webpage has changed.');
  await sendWhatsAppMessage('The content of the monitored webpage has changed.');
  // } else {
  //   console.log('No changes detected.');
  // }
}

const job = new cron.CronJob('*/5 * * * *', checkForChanges, null, true, 'Asia/Karachi');
job.start();
