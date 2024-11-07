"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './SellerReviewItems.css';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface Item {
  id: number;
  itemName: string;
  price: number;
  startDate: string;
  endDate: string;
  status: string;
}

function getUsernameFromToken(idToken: string) {
  if (idToken) {
    const decoded = jwtDecode(idToken);
    return (decoded as JwtPayload & { 'cognito:username': string })['cognito:username'];
  }
  return null;
}

function SellerReviewItems() {
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
        `https://hoobnngov9.execute-api.us-east-1.amazonaws.com/prod/seller/reviewItems`,
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

  const handleActionButtonClick = (itemId: number) => {
    const action = selectedActions[itemId];
    if (action) {
      console.log(`Performing action: ${action} on item ID: ${itemId}`);
      //TODO: Implement logic for each action
    } else {
      alert('Please select an action first.');
    }
  };

  useEffect(() => {
    const idToken = localStorage.getItem('idToken');
    if (idToken) {
      const decodedUsername = getUsernameFromToken(idToken);
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

  const handleItemClick = (itemId: number) => {
    router.push(`/editItem/${itemId}`);
  };

  return (
    <div className="seller-review-items">
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

      <div className="search-bar">
        <input type="text" placeholder="Enter text to search" />
        <button>🔍</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <table className="item-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Price <span className="sort-arrows">⇅</span></th>
            <th>Start Date <span className="sort-arrows">⇅</span></th>
            <th>End Date <span className="sort-arrows">⇅</span></th>
            <th>Status</th>
            <th>Seller Actions</th>
            <th>Action</th> {/* New column for the action button */}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(items) && items.length > 0 ? (
            items.map((item) => (
              <tr key={item.id}>
                <td>
                  <button className="item-name" onClick={() => handleItemClick(item.id)}>
                    {item.itemName}
                  </button>
                </td>
                <td>${item.price}</td>
                <td>{item.startDate}</td>
                <td>{item.endDate}</td>
                <td>{item.status}</td>
                <td>
                  <select
                    onChange={(e) => handleActionChange(item.id, e.target.value)}
                    defaultValue=""
                  >
                    <option value="">Select Action</option>
                    <option value="Publish">Publish Item</option>
                    <option value="Unpublish">Unpublish Item</option>
                    <option value="Edit">Edit Item</option>
                    <option value="Fulfill">Fulfill Item</option>
                    <option value="Request">Request Item</option>
                    <option value="Unfreeze">Unfreeze</option>
                    <option value="Archive">Archive Item</option>
                  </select>
                </td>
                <td>
                  <button className="bg-gray-400 text-white py-2 px-4 rounded-lg"
                    onClick={() => handleActionButtonClick(item.id)}
                    disabled={!selectedActions[item.id]}
                  >
                    Perform Action
                  </button>
                </td> {/* Action button */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7}>No items found</td> {/* Adjusted colspan for the new column */}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SellerReviewItems;
