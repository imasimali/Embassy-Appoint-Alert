const axios = require('axios');
const fs = require('fs');
const path = require('path');

const urlToMonitor = 'https://service2.diplo.de/rktermin/extern/choose_categoryList.do?locationCode=isla&realmId=108';
const initialContentPath = path.join(__dirname, 'initialContent.html');

async function saveInitialContent() {
  try {
    const response = await axios.get(urlToMonitor);
    fs.writeFileSync(initialContentPath, response.data);
    console.log('Initial content saved.');
  } catch (error) {
    console.error(`Error fetching the URL: ${error}`);
  }
}

saveInitialContent();
