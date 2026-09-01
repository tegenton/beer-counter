import 'dotenv/config';
import express from 'express';
import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { DiscordRequest } from './utils.js';
import { readFile, writeFile } from 'fs';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

const drinks = {};
readFile('drinks.json', 'utf8', (err, data) => {
  if (data) {
    drinks = JSON.parse(data);
  }
});

function drink(user, beverage) {
  if (!user in drinks) {
    drinks[user] = {"beer": 0, "lemonade": 0, "milk": 0};
  }
  drinks[user][beverage]++;
  writeFile('drinks.json', JSON.stringify(drinks), (err) => {
    if (err) {
      console.log(err);
    }
  });
  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
      components: [
	{
	  type: MessageComponentTypes.TEXT_DISPLAY,
	  content: `<@${user}> had a ${beverage}`
	}
      ]
    },
  });
}

function tally(tallee) {
  let message;
  if (tallee === 'all') {
    let total = {"beer": 0, "lemonade": 0, "milk": 0};
    for (let user in drinks) {
      total["beer"] += drinks[user]["beer"];
      total["milk"] += drinks[user]["milk"];
      total["lemonade"] += drinks[user]["lemonade"];
    }
    message = 'In total, everyone has had:\n'
    for (let bev in total) {
      message += `${bev}: ${total[bev]}\n`;
    }
  } else if (tallee in drinks) {
    message = `<@${tallee}> has had:\n`;
    for (let bev in drinks[tallee]) {
      message += `${bev}: ${drinks[tallee][bev]}\n`;
    }
  } else {
    message = `<@${tallee}> must be thirsty, they have had nothing to drink!`;
  }
  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
      components: [
	{
	  type: MessageComponentTypes.TEXT_DISPLAY,
	  content: message
	}
      ]
    },
  });
}

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction id, type and data
  const { id, type, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;
    const context = req.body.context;
    const user = context === 0 ? req.body.member.user.id : req.body.user.id;
    let beverage = 'beer';
    let amount = 1;

    if (name === 'drink' || name === 'beer') {
      for (let option of req.body.data.options) {
	if (option.name === 'beverage') {
	  beverage = option.value;
	} else if (option.name === 'amount') {
	  amount = option.value;
	}
      }
      return drink(user, beverage);
    } else if (name === 'tally') {
      let tallee = 'all';
      for (let option of req.body.data.options) {
	if (option.name === 'user') {
	  tallee = option.value;
	}
      }
      return tally(tallee);
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
