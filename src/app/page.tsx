"use client";

import React, { useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json'; // Your Amplify outputs
import '@aws-amplify/ui-react/styles.css';

// Configure Amplify
Amplify.configure(outputs);

const App = () => {
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');

  const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRole(event.target.value as 'buyer' | 'seller');
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main style={{ padding: '2rem' }}>
          <h1>Hello, {user?.username}</h1>
          <p>Login as:</p>
          <label>
            <input
              type="radio"
              value="buyer"
              checked={role === 'buyer'}
              onChange={handleRoleChange}
            />
            Buyer
          </label>
          <label>
            <input
              type="radio"
              value="seller"
              checked={role === 'seller'}
              onChange={handleRoleChange}
            />
            Seller
          </label>
          <div style={{ marginTop: '1rem' }}>
            <p>You are logged in as: {role}</p>
          </div>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
};

export default App;
