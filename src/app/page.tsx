"use client";

import React, { useState, useEffect } from 'react';
import { Radio, RadioGroupField, Button } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(outputs);

const App = () => {
  const [userType, setUserType] = useState('Buyer');
  const [isSignUp, setIsSignUp] = useState(false); // First tab seen will be log in
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
  }, []);

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
      const buyerSignUpEndpoint = ''; // TODO (AB): Add buyer sign up endpoint
      // TODO (AB): Add log in endpoints

      let endpoint = '';
      let body;

      if (isSignUp) {
        if (userType === 'Buyer') {
          endpoint = buyerSignUpEndpoint;
        } else {
          endpoint = sellerSignUpEndpoint;
        }
        body = JSON.stringify({ username, password, email }); // Cognito requires email for sign up
      } else {
        // TODO (AB): Add full sign in logic
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

      // Reset form fields
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

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      maxWidth: '500px',
      margin: '0 auto',
      padding: '30px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      backgroundColor: '#fff',
    },
    button: {
      flex: 1,
      padding: '15px',
      border: 'none',
      borderRadius: '8px 8px 0 0',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      fontSize: '16px',
      fontWeight: 'bold',
    },
    loginButton: {
      backgroundColor: isSignUp ? '#f0f0f0' : '#007bff',
      color: isSignUp ? '#000' : '#fff',
    },
    signupButton: {
      backgroundColor: isSignUp ? '#007bff' : '#f0f0f0',
      color: isSignUp ? '#fff' : '#000',
    },
    input: {
      display: 'block',
      width: '100%',
      padding: '15px',
      margin: '10px 0',
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '16px',
    },
    title: {
      fontSize: '28px',
      marginBottom: '20px',
    },
    tabContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '20px',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{isSignUp ? 'Sign Up' : 'Log In'}</h1>
      <div style={styles.container}>
        <button
          style={{ ...styles.button, ...styles.loginButton }}
          onClick={() => setIsSignUp(false)}
        >
          Log In
        </button>
        <button
          style={{ ...styles.button, ...styles.signupButton }}
          onClick={() => setIsSignUp(true)}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        {isSignUp && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        )}
        <RadioGroupField
          legend="User Type"
          name="user_type"
          value={userType}
          onChange={handleUserTypeChange}
        >
          <Radio value="Buyer">Buyer</Radio>
          <Radio value="Seller">Seller</Radio>
        </RadioGroupField>
        <Button
          type="submit"
          style={styles.button}
        >
          {isSignUp ? 'Sign Up' : 'Log In'}
        </Button>
      </form>
    </div>
  );
};

export default App;
