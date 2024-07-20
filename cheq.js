require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

//Authenticate and retrieve the access token from CHEQ
async function getCheqToken() {
  // hide clientID and clientSecrete in .EVN
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  try {
    const response = await axios.post('https://iam.cheq-platform.com/authorize', {
      username: clientId,
      password: clientSecret
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Access token obtained successfully');
    return response.data.access_token;
  } catch (error) {
    console.error('Authentication failed:', error.message);
    throw error;
  }
}


//Fetch data from the CHEQ API with one retry if there is a problem
async function getCheqData(token, startDate, endDate, fields, page, retries = 1) {
  try {
    const response = await axios.post('https://skewed-analytics-api.cheq-platform.com/data', {
      startDate: startDate,
      endDate: endDate,
      fields: fields,
      page: page
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`);
      return getCheqData(token, startDate, endDate, fields, page, retries - 1);
    } else {
      console.error(`Error getting data for page ${page}:`, error.response ? error.response.data : error.message);
      throw error;
    }
  }
}


 //Save fetched data to a CSV file
async function saveDataToCsv(page, data) {
  const filePath = path.join(__dirname, `page_${page}.csv`);

  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      {id: 'timestamp', title: 'Timestamp'},
      {id: 'ip', title: 'IP'},
      {id: 'userAgent', title: 'User Agent'},
      {id: 'platformOrigin', title: 'Platform Origin'},
      {id: 'campaignName', title: 'Campaign Name'},
      {id: 'source', title: 'Source'},
      {id: 'url', title: 'URL'},
      {id: 'device', title: 'Device'},
      {id: 'detection', title: 'Detection'},
      {id: 'threatGroup', title: 'Threat Group'},
      {id: 'term', title: 'Term'},
      {id: 'platform', title: 'Platform'},
      {id: 'medium', title: 'Medium'},
      {id: 'content', title: 'Content'},
      {id: 'gtmEvents', title: 'GTM Events'}
    ]
  });

  // Convert arrays to string representation this is for gtmEvents to show better in the CSV
  const records = data.data.map(record => {
    if (Array.isArray(record.gtmEvents)) {
      // Join array elements into a single string
      record.gtmEvents = record.gtmEvents.join(',');
    }
    return record;
  });

  await csvWriter.writeRecords(records);
  console.log(`Page ${page} data saved to ${filePath}`);
}

// Main function to fetch and save data
 
async function saveCheqData() {
  try {
    const token = await getCheqToken();
    
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    const startDate = threeDaysAgo.toISOString().split('T')[0] + " 00:00:00";
    const endDate = threeDaysAgo.toISOString().split('T')[0] + " 23:59:59";

    const fields = ['timestamp', 'ip', 'userAgent', 'platformOrigin', 'campaignName', 'source', 'url', 'device', 'detection', 'threatGroup', 'term', 'platform', 'medium', 'content', 'gtmEvents'];

    for (let page = 1; page <= 5; page++) {
      const data = await getCheqData(token, startDate, endDate, fields, page);
      await saveDataToCsv(page, data);
    }

    console.log('Data fetching and saving completed successfully');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Execute the main function
saveCheqData();












