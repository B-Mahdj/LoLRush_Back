import { endChallenge } from '../utils/endChallenge';
import { client } from '../database/config';
const nodemailer = require("nodemailer");
const fs = require('fs');
require('dotenv').config();

export async function createChallenge(email: string, player_usernames: string[], region: string, challengeDurationDays: number): Promise<number | null> {
  try {
    await client.connect();
    const db = client.db("LoLRushDB");
    const collection = db.collection("Page");

    // Generate a code that is of 8 digits long and is unique to the page
    let code: number = Math.floor(10000000 + Math.random() * 90000000);

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + challengeDurationDays);

    const newPage = {
      email: email,
      player_usernames: player_usernames,
      region: region,
      challengeEndDate: endDate,
      code: code,
      finished: false,
    };

    // Insert the new page document
    await collection.insertOne(newPage);
    console.log('Document inserted:', newPage);

    // Schedule the end of challenge
    const timeout = (endDate.getTime() - Date.now());
    setTimeout(() => {
      (async () => {
        await endChallenge(code, collection);
      })();
    }, timeout);

    console.log('Challenge will end in', timeout, 'ms');
    sendCodeToEmail(email, code);
    return code;
  } catch (err) {
    console.error('Error:', err);
  }
  finally {
    await client.close();
  }

}

async function sendCodeToEmail(toEmail: string, code: number) {
  let transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
      user: process.env.EMAIL_ADDRESS_TO_SEND_CODE_FROM,
      pass: process.env.EMAIL_ADDRESS_PASSWORD_TO_SEND_CODE_FROM,
    },
  });

  const htmlContent = fs.readFileSync('./src/utils/mail.html', 'utf-8');

  const customizedHtmlContent = htmlContent.replace(/{{challengeCode}}/g, code.toString());
    
  let options = {
    from: process.env.EMAIL_ADDRESS_TO_SEND_CODE_FROM,
    to: toEmail,
    subject: "Your LoLRush code",
    html: customizedHtmlContent,
  };

  transporter.sendMail(options, (error: any, info: any) => {
    if (error) console.log(error)
    else console.log(info)
  });
}