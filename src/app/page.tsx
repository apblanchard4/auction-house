"use client";

import React from 'react';
import { Authenticator, Radio, RadioGroupField } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(outputs);

const App = () => {
  return (
    <Authenticator
      components={{
        SignUp: {
          FormFields() {

            return (
              <>
                <Authenticator.SignUp.FormFields />
                <RadioGroupField
                  legend="User Type"
                  name="user_type"
                >
                  <Radio value="Buyer">Buyer</Radio>
                  <Radio value="Seller">Seller</Radio>
                </RadioGroupField>
              </>
            );
          },
        },
      }}>
    </Authenticator>
  );
};

export default App;
