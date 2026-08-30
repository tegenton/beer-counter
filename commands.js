import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

const amount = {
  type: 4,
  name: 'amount',
  description: 'How many?',
  required: false,
}

const DRINK_COMMAND = {
  name: 'drink',
  description: 'Drink something',
  options: [
    {
      type: 3,
      name: 'beverage',
      description: 'Pick your beverage',
      required: false,
      choices: [
        {name: 'Beer', value: 'beer'},
        {name: 'Milk', value: 'milk'},
        {name: 'Lemonade', value: 'lemonade'},
      ],
    },
    amount,
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
}

const BEER_COMMAND = {
  name: 'beer',
  description: 'Drink a BEER!',
  options: [
    amount,
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
}

const TALLY_COMMAND = {
  name: 'tally',
  description: 'Tally up drinks',
  options: [
    {
      type: 6,
      name: 'user',
      description: 'Check someone in particular',
      required: false,
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
}

const ALL_COMMANDS = [DRINK_COMMAND, BEER_COMMAND, TALLY_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
