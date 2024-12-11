"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './sellerReviewItems.css';
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
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [selectedActions, setSelectedActions] = useState<{ [key: number]: string }>({});
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSort = (key: keyof Item) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedItems = [...filteredItems].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredItems(sortedItems);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (value) {
      setFilteredItems(items.filter(item => item.itemName.toLowerCase().includes(value.toLowerCase())));
    } else {
      setFilteredItems(items);
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
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('You must log in first');
      router.push('/');
      return;
    }

    if (action === 'Unpublish') {
      const item = filteredItems.find((item) => item.id === itemId);
      if (item?.status !== 'Active') {
        alert('Item is already unpublished');
        return;
      }

      try {
        const response = await fetch(
          `https://hzob7hmuph.execute-api.us-east-1.amazonaws.com/prod/seller/unpublishItem`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sellerUsername: username,
              itemID: itemId,
            }),
          }
        );
        const result = await response.json();
        if (response.ok) {
          alert('Item unpublished successfully');
          setFilteredItems((prevItems) =>
            prevItems.map((item) =>
              item.id === itemId ? { ...item, status: 'Inactive' } : item
            )
          );
        } else {
          alert(result.message || 'Failed to unpublish item');
        }
      } catch {
        alert('An error occurred while unpublishing the item');
      }
    }

    //Pubish
    if (action === 'Publish') {
      const item = filteredItems.find((item) => item.id === itemId);
      if (item?.status !== 'Inactive') {
        alert('Item is already published');
        return;
      }
      const body = JSON.stringify({
        sellerUsername: username,
        itemId: itemId,
      });
      console.log('body', body);

      try {
        const response = await fetch(
          `https://t033iv5klk.execute-api.us-east-1.amazonaws.com/prod/sellerpublishItem-prod`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: body,
          }
        );
        const result = await response.json();
        if (response.ok) {
          alert('Item published successfully');
          setFilteredItems((prevItems) =>
            prevItems.map((item) =>
              item.id === itemId ? { ...item, status: 'Active' } : item
            )
          );
        } else {
          alert(result.message || 'Failed to publish item');
        }
      } catch {
        alert('An error occurred while publishing the item');
      }
    }

    if (action === 'Edit') {
      const item = filteredItems.find((item) => item.id === itemId);
      if (item) {
        if (item.status === 'Inactive') {
          router.push(`/seller/editItem?itemId=${itemId}`);
        } else {
          alert('Item is already active and cannot be edited');
        }
      } else {
        alert('Item not found');
      }
    }

    if (action === 'Remove') {
      const item = filteredItems.find((item) => item.id === itemId);
      if (item?.status !== 'Inactive') {
        alert('Item is not inactive and cannot be removed');
        return;
      }

      try {
        const response = await fetch(
          `https://dezgzbir75.execute-api.us-east-1.amazonaws.com/prod/seller/removeInactiveItem`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sellerUsername: username, itemId: itemId }),
          }
        );
        if (response.ok) {
          alert("Item removed successfully.");
          window.location.reload();
        } else {
          const result = await response.json();
          alert(result.message || "Failed to remove item.");
        }
      } catch (error) {
        alert("An error occurred while removing the item." + error);
      }
    }
    if (action === 'Archive') {
      const item = filteredItems.find((item) => item.id === itemId);
      if (item?.status !== 'Inactive') {
        alert('Item is active, cannot be archived');
        return;
      }

      try {
        const response = await fetch(
          `https://w35nmm676d.execute-api.us-east-1.amazonaws.com/prod/seller/archiveItem`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sellerUsername: username,
              itemId: itemId,
            }),
          }
        );
        const result = await response.json();
        if (response.status === 200) {
          alert('Item unpublished successfully');
          setFilteredItems((prevItems) =>
            prevItems.map((item) =>
              item.id === itemId ? { ...item, status: 'Inactive' } : item
            )
          );
        } else {
          alert(result.message || 'Failed to unpublish item');
        }
      } catch {
        alert('An error occurred while unpublishing the item');
      }
    }
    if (action === 'Fulfill') {
      const item = filteredItems.find((item) => item.id === itemId);
      if (item?.status !== 'Completed') {
        alert('Item cannot be fufilled because it is not completed');
        return;
      }

      try {
        const response = await fetch(
          `https://sj88qivm8j.execute-api.us-east-1.amazonaws.com/prod/seller/fulfillItem`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sellerUsername: username,
              itemId: itemId,
            }),
          }
        );
        const result = await response.json();
        if (response.status === 200) {
          alert('Item fulfilled successfully');
          setFilteredItems((prevItems) =>
            prevItems.map((item) =>
              item.id === itemId ? { ...item, status: 'Fulfilled' } : item
            )
          );
        } else {
          alert(result.message || 'Failed to fulfill item');
        }
      } catch {
        alert('An error occurred while fulfilling the item');
      }
    }
  }

  useEffect(() => {
    const fetchItems = async (user: string) => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('You must log in first.');
        router.push('/');
        return;
      }

      const body = JSON.stringify({ sellerUsername: user });

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

        if (responseData.statusCode !== 200) {
          const message = responseData.body ? JSON.parse(responseData.body).message : 'Request failed';
          throw new Error(message);
        }

        let itemsData = responseData.body;
        if (typeof itemsData === 'string') {
          itemsData = JSON.parse(itemsData);
        }

        if (Array.isArray(itemsData)) {
          setItems(itemsData);
          setFilteredItems(itemsData);
        } else {
          throw new Error('Response body is not an array');
        }

      } catch {
        alert('An error occurred while fetching items');
      }
    };

    const idToken = localStorage.getItem('idToken');
    if (idToken) {
      const decodedUsername = getUsernameFromToken(idToken);
      if (decodedUsername) {
        setUsername(decodedUsername);
        fetchItems(decodedUsername);
      } else {
        alert('Failed to decode token or username not found.');
        router.push('/');
      }
    } else {
      alert('No token found. Please log in.');
      router.push('/');
    }
  }, [router]);

  return (
    <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Assembly Auction</h1>
        <div className="text-gray-700">
          <span className="font-semibold">{username}</span> | <span>Seller</span>
        </div>
      </header>

      <div className="navigation">
        <button onClick={() => router.push('/seller/viewAccount')}>Account</button>
        <button className="active" onClick={() => router.push('/seller/reviewItems')}>My Items</button>
        <button onClick={() => router.push('/seller/addItem')}>Add Item</button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter text to search"
          value={searchTerm}
          onChange={handleSearch}
        />
        <button>🔍</button>
      </div>


      <table className="item-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th onClick={() => handleSort('price')}>Price <span className="sort-arrows">⇅</span></th>
            <th onClick={() => handleSort('startDate')}>Start Date <span className="sort-arrows">⇅</span></th>
            <th onClick={() => handleSort('endDate')}>End Date <span className="sort-arrows">⇅</span></th>
            <th>Status</th>
            <th>Seller Actions</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <button className="item-name" onClick={() => router.push(`/seller/viewItem?itemId=${item.id}`)}>
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
                    <option value="Unfreeze">Unfreeze</option>
                    <option value="Archive">Archive Item</option>
                    <option value="Remove">Remove Item</option>
                  </select>
                </td>
                <td>
                  <button
                    className="bg-gray-400 text-white py-2 px-4 rounded-lg"
                    onClick={() => handleActionButtonClick(item.id)}
                    disabled={!selectedActions[item.id]}
                  >
                    Perform Action
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7}>No items found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SellerReviewItems;
