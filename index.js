const uuid = require('uuid');
const axios = require('axios');

const username = process.env.CFS_USER;
const password = process.env.CFS_PW;
const site = process.env.SITE;

async function main() {
  try {
    const response = await axios.get(`https://${username}:${password}@${site}.6river.org`);
  } catch (err) {
    console.log(err);
  }
}


main().catch(console.error);