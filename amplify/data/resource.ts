import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { schema as generatedSqlSchema } from './schema.sql';

// Global authorization rule
const sqlSchema = generatedSqlSchema.authorization(allow => allow.guest());

// Define the schema based on the MySQL database schema
const schema = a.schema({
  Item: a
    .model({
      id: a.integer().required(),
      name: a.string().required(),
      description: a.string(),
      image: a.string().required(),
      initialPrice: a.float().required(),
      published: a.boolean().required(),
      archived: a.boolean().required(),
      frozen: a.boolean().required(),
      fulfilled: a.boolean().required(),
      startDate: a.date(),
      length: a.integer(),
    })
    .authorization((allow) => [allow.owner()]),

  Bid: a
    .model({
      id: a.integer().required(),
      buyerUsername: a.string(),
      amount: a.float().required(),
      dateMade: a.date().required(),
      itemName: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

  Seller: a
    .model({
      username: a.string().required(),
      password: a.string().required(),
      active: a.boolean().required(),
      funds: a.float().required(),
    })
    .authorization((allow) => [allow.owner()]),

  Buyer: a
    .model({
      username: a.string().required(),
      password: a.string().required(),
      active: a.boolean().required(),
      funds: a.float().required(),
    })
    .authorization((allow) => [allow.owner()]),
});

// Define the Client Schema type and data export
export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
