"use client";

import React, { useState } from 'react';
import { Radio, RadioGroupField, Button } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
<<<<<<< HEAD:src/app/page.tsx
import outputs from '../aws-exports';
=======
import outputs from '../../aws-exports';
import { useRouter } from 'next/router';
>>>>>>> eb1e1e8314d06ca127e3316338bdb5aa0d57afd1:src/app/login-or-create/page.tsx
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(outputs);

const App = () => {
  const router = useRouter();
  const [userType, setUserType] = useState('Buyer');
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleUserTypeChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setUserType(event.target.value);
  };

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();

    try {
      if (!username || !password) {
        if (isSignUp && !email) {
          alert('Username, password, and email are required');
          throw new Error('Username, password, and email are required');
        } else {
          alert('Username and password are required');
          throw new Error('Username and password are required');
        }
      }
      const sellerSignUpEndpoint = 'https://ftzq7wjyef.execute-api.us-east-1.amazonaws.com/prod/openSellerAccount';
      const buyerSignUpEndpoint = 'https://zenehpt22h.execute-api.us-east-1.amazonaws.com/prod/openBuyerAccount';
      const sellerLogInEndpoint = 'https://pzvpd6xqdh.execute-api.us-east-1.amazonaws.com/prod/loginSellerAccount';
      const buyerLogInEndpoint = 'https://5e1oyazlof.execute-api.us-east-1.amazonaws.com/prod/loginBuyerAccount';

      let endpoint = '';
      let body;

      if (isSignUp) {
        endpoint = userType === 'Buyer' ? buyerSignUpEndpoint : sellerSignUpEndpoint;
        body = JSON.stringify({ username, password, email });
      } else {
        endpoint = userType === 'Buyer' ? buyerLogInEndpoint : sellerLogInEndpoint;
        body = JSON.stringify({ username, password });
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });

      if (!response.ok) {
        throw new Error(isSignUp ? 'Failed to create user' : 'Failed to log in');
      }

      const result = await response.json();
      console.log(`${isSignUp ? 'User created' : 'Logged in'} successfully:`, result);
      alert(`${isSignUp ? 'User created' : 'Logged in'} successfully`);

      //route to sellerReviewItems page if seller
      if(!isSignUp && userType === 'Seller') {
        router.push('/sellerReviewItems');
      }

      setUsername('');
      setPassword('');
      setEmail('');
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unknown error occurred');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg mt-10">
      <h1 className="text-3xl font-semibold text-center mb-8">
        {isSignUp ? 'Sign Up' : 'Log In'}
      </h1>

      <div className="flex justify-around mb-6">
        <button
          onClick={() => setIsSignUp(false)}
          className={`px-4 py-2 font-bold text-lg w-1/2 rounded-tl-lg border border-r-0 transition-colors duration-200 ${!isSignUp ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
        >
          Log In
        </button>
        <button
          onClick={() => setIsSignUp(true)}
          className={`px-4 py-2 font-bold text-lg w-1/2 rounded-tr-lg border transition-colors duration-200 ${isSignUp ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
        />
        {isSignUp && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        )}

        <RadioGroupField
          legend="User Type"
          name="user_type"
          value={userType}
          onChange={handleUserTypeChange}
          className="text-sm text-gray-700"
        >
          <Radio value="Buyer">Buyer</Radio>
          <Radio value="Seller">Seller</Radio>
        </RadioGroupField>

        <Button
          type="submit"
          className="w-full py-3 mt-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          {isSignUp ? 'Sign Up' : 'Log In'}
        </Button>
      </form>
    </div>
  );
};

export default App;
