"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './sellereditItem.css';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface Item {
  id: number;
  itemName: string;
  description: string;
  price: number;
  startDate: string;
  status: string;
}

function getUsernameFromToken(idToken: string) {
  if (idToken) {
    const decoded = jwtDecode(idToken);
    return (decoded as JwtPayload & { 'cognito:username': string })['cognito:username'];
  }
  return null;
}

function SellerEditItems() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);  // Initializing items as an empty array
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [selectedActions, setSelectedActions] = useState<{ [key: number]: string }>({}); //track what action is selected

  const fetchItems = async (user: string) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('You must log in first.');
      router.push('/'); // Redirect to login if no token is found
      return;
    }

    const body = JSON.stringify({ sellerUsername: user });
    console.log("Request body:", body);

    try {
      const response = await fetch(
        'https://qbylae5by7.execute-api.us-east-1.amazonaws.com/prod/seller/editItem',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: body,
        }
      );

      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (responseData.statusCode !== 200) {
        const message = responseData.body ? JSON.parse(responseData.body).message : 'Request failed';
        throw new Error(message);
      }

      let itemsData = responseData.body;
      if (typeof itemsData === 'string') {
        try {
          itemsData = JSON.parse(itemsData);  // Parse the string into JSON
        } catch (error) {
          throw new Error('Failed to parse response body as JSON');
        }
      }

      if (Array.isArray(itemsData)) {
        setItems(itemsData);
      } else {
        throw new Error('Response body is not an array');
      }

    } catch (err) {
      const typedError = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(typedError.message);
    }
  };

  const handleActionChange = (itemId: number, action: string) => {
    setSelectedActions((prevState) => ({
      ...prevState,
      [itemId]: action,
    }));
  };

  const handleActionButtonClick = async (itemId: number) => {
    const action = selectedActions[itemId];
    if (action) {
      const updatedItem = items.find(item => item.id === itemId);
      if (updatedItem) {
        try {
          const accessToken = localStorage.getItem('accessToken');
          if (!accessToken) {
            alert('You must log in first.');
            router.push('/'); // Redirect to login if no token is found
            return;
          }

    const body = JSON.stringify({
    sellerUsername: username,
    itemId: itemId,
    newName: updatedItem.itemName,
    newDescription: updatedItem.description,
    newPrice: updatedItem.price,
    newStartDate: updatedItem.startDate,
     });

     const response = await fetch(
        `https://hoobnngov9.execute-api.us-east-1.amazonaws.com/prod/seller/editItem`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: body,
        }
      );

      const responseData = await response.json();
          if (responseData.statusCode === 200) {
            alert('Item updated successfully!');
          } else {
            alert('Failed to update item');
          }
        } catch (error) {
          alert('Error updating item');
        }
      }
    } else {
      alert('Please select an action first.');
    }
  };

  useEffect(() => {
    const idToken = localStorage.getItem('idToken');
    if (idToken) {
      const decodedUsername = getUsernameFromToken(idToken);
      console.log(decodedUsername);
      if (decodedUsername) {
        setUsername(decodedUsername);
        fetchItems(decodedUsername); // Fetch items after setting username
      } else {
        alert('Failed to decode token or username not found.');
        router.push('/'); // Redirect to login if username is not found in token
      }
    } else {
      alert('No token found. Please log in.');
      router.push('/');
    }
  }, [router]);

  const handleItemChange = (itemId: number, field: string, value: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };


  return (
    <div className="seller-edit-items">
      <header className="header">
        <h1>Assembly Auction</h1>
        <div className="user-info">
          <span>{username}</span> | <span>Seller</span> | <span>$X.XX</span>
        </div>
      </header>

      <div className="navigation">
        <button onClick={() => router.push('/account')}>Account</button>
        <button className="active" onClick={() => router.push('/sellerReviewItems')}>My Items</button>
        <button onClick={() => router.push('/addItem')}>Add Item</button>
      </div>


      {error && <div className="error-message">{error}</div>}

      <div className="editable-text-field">
      <label className="field-label">Item Name:</label>
        <input
          type="text"
        //   value={newitemName}
        //   onChange={(e) => setItemName(e.target.value)}
          className="editable-input"
        />
        </div>
      <div className="editable-field">
        <label className="field-label">Description</label>
        <input
          type="text"
        //   value={}
        //   onChange={(e) => setDescription(e.target.value)}
          className="editable-input"
        />
      </div>
      <div className="editable-field">
        <label className="field-label">Initial Price</label>
        <input
          type="text"
          value={0}
        //   onChange={(e) => setDescription(e.target.value)}
          className="editable-input"
        />
      </div>
      <div className="editable-field">
        <label className="field-label">Start Date</label>
        <input
          type="text"
          value={0}
        //   onChange={(e) => setDescription(e.target.value)}
          className="editable-input"
        />
      </div>
    </div>
  );
}

export default SellerEditItems;