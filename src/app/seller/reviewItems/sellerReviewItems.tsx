import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './SellerReviewItems.css';
import { Amplify } from 'aws-amplify';
import outputs from '../../../aws-exports.js'
import { Router } from 'react-router-dom';
Amplify.configure(outputs);

interface Item {
  id: number;
  itemName: string;
  price: number;
  startDate: string;
  endDate: string;
  status: string;
}

function SellerReviewItems() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sellerUsername] = useState<string | null>(null);
  
  useEffect(() => {
   
    const fetchItems = async () => {
      try {
        const response = await fetch(`https://hoobnngov9.execute-api.us-east-1.amazonaws.com/prod/seller/${sellerUsername}`);
        if (!response.ok) {
          throw new Error('Failed to fetch items');
        }
        const data = await response.json();
        setItems(data);
      } catch (err) {
        const typedError = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(typedError.message);
      }
    };

    fetchItems();
  }, [sellerUsername]);

  const handleItemClick = (itemId: number) => {
    router.push(`/editItem/${itemId}`);
  };

  return (
    <div className="seller-review-items">
      <header className="header">
        <h1>Assembly Auction</h1>
        <div className="user-info">
          <span>{sellerUsername}</span> | <span>Seller</span> | <span>$X.XX</span>
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
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
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
                  <select>
                    <option>Publish Item</option>
                    <option>Unpublish Item</option>
                    <option>Edit Item</option>
                    <option>Fulfill Item</option>
                    <option>Request Item</option>
                    <option>Unfreeze</option>
                    <option>Archive Item</option>
                  </select>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>No items found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SellerReviewItems;
