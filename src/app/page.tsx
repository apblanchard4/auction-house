"use client";

import React, { useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(outputs);

/* Customize AWS Authenticator input to add role (buyer / seller) field */
const formFields = {
  signIn: {
    username: {
      label: 'Username:',
      placeholder: 'Enter your username',
    },
    extraFields: {
      label: 'Role:',
      placeholder: 'Enter your role (buyer or seller)',
      isRequired: true,
      type: 'radio',
      options: ['buyer', 'seller'],
    },
  },
  signUp: {
    email: {
      placeholder: 'Enter your email',
      label: 'Email:',
      isRequired: true,
      order: 1,
    },
    username: {
      placeholder: 'Enter your username',
      label: 'Username:',
      isRequired: true,
      order: 2,
    }, password: {
      label: 'Password:',
      placeholder: 'Enter your Password:',
      isRequired: false,
      order: 3,
    },
    confirm_password: {
      label: 'Confirm Password:',
      order: 4,
    },
    extraFields: {
      label: 'Role:',
      placeholder: 'Enter your role (buyer or seller)',
      isRequired: true,
      order: 5,
    },
  }
}

const App = () => {
  return (
    <Authenticator formFields={formFields}>
      <h1>My App Content</h1>
    </Authenticator >
  );
};

export default App;
