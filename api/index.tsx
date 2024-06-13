//Make sure  to run npm install --save-dev @types/react to fix the error
// npm init frog

import dotenv from 'dotenv';
dotenv.config();

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'

    // import { NeynarAPIClient, FeedType, FilterType } from "@neynar/nodejs-sdk";
    // const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY);
    // console.log(`process.env.NEYNAR_API_KEY: `,process.env.NEYNAR_API_KEY);
    const neaynarKey= process.env.NEYNAR_API_KEY || "NEYNAR_FROG_FM";


// Uncomment to use Edge Runtime. 
export const config = {
  runtime: 'edge',
}
 
export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  hub: neynar({ apiKey: neaynarKey})
})



app.frame("/", async (c) => {

  const { req, buttonIndex, buttonValue, status } = c
 
  //#region Neynar Vaildation
  // If valid == true then frame is valid and use the data
  if (status === 'response') {
    const payload = await req.json();
    console.log(`***> payload for / : `,payload);
  }
  // console.log(`*************************`);

  // const response = await client.validateFrameAction(payload.trustedData.messageBytes);
  // console.log(`Neynar validation request for /`,response);
  // console.log(`*************************`);
  //#endregion Neynar Vaildation


  console.log(`buttonIndex: ${buttonIndex} buttonValue: ${buttonValue}, status: ${status}`); 
  // buttonIndex: undefined buttonValue: undefined, status: initial  //FIRST TIME AROUND
  // buttonIndex: 1 buttonValue: undefined, status: response        //SECOND TIME AROUND THIS IS DEFAULT SO OF NO USE -> ACTION IS IN /response


  return c.res({
    action: "/result",

    image: (
      <div
        style={{
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 60,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 30,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
          }}
        >
          Choose your weapon
        </div>
      </div>
    ),
    intents: [
      <Button value="rock">Rock</Button>,
      <Button value="paper">Paper</Button>,
      <Button value="scissors">Scissors</Button>,
    ],
  });
});

app.frame("/result", async (c) => {
  const { req, buttonIndex, buttonValue, status } = c

  //#region Neynar Validation
  // If valid == true then frame is valid and use the data
  const payload = await req.json();
  console.log(`***> payload for /result: `,payload);
  // console.log(`*************************`);

  // const response = await client.validateFrameAction(payload.trustedData.messageBytes);
  // console.log(`Neynar validation request for /result`,response);
  // console.log(`*************************`);
  //#endregion Neynar Vaildation

  console.log(`buttonIndex: ${buttonIndex} buttonValue: ${buttonValue}, status: ${status}`); //buttonIndex: 1 buttonValue: rock, status: response

  const rand = Math.floor(Math.random() * 3);
  const choices = ["rock", "paper", "scissors"];
  const userChoice = choices[(c.buttonIndex || 1) - 1];
  const computerChoice = choices[rand];
  let msg = "";

  if (userChoice === computerChoice) {
    msg = "draw";
  }

  if (
    (userChoice === "rock" && computerChoice === "scissors") ||
    (userChoice === "paper" && computerChoice === "rock") ||
    (userChoice === "scissors" && computerChoice === "paper")
  ) {
    msg = "You win";
  }

  if (
    (userChoice === "rock" && computerChoice === "paper") ||
    (userChoice === "paper" && computerChoice === "scissors") ||
    (userChoice === "scissors" && computerChoice === "rock")
  ) {
    msg = "You lose";
  }

  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 60,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 30,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
            display: "flex",
          }}
        >
          {userChoice} vs {computerChoice}
        </div>

        <div
          style={{
            color: "white",
            fontSize: 60,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 30,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
          }}
        >
          {msg}
        </div>
      </div>
    ),
    intents: [<Button action="/">Play again</Button>],
  });
});

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
