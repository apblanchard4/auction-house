import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SellerItemList = () => {
    const [items, setItems] = useState<any[]>([]);
    const [sortConfig, setSortConfig] = useState({ key: 'itemName', direction: 'asc' });

    //TO-DO: Replace with variable sellerID 
    const sellerID = 'a';  

    useEffect(() => {
        const fetchItems = async () => {
            try {
                //TO-DO: Update URL to correct endpoint 
                const response = await axios.get(``, {
                    params: { sellerID }
                });
                setItems(response.data as any[]);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        fetchItems();
    }, [sellerID]);

    const sortItems = (key: string) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });
    };

    const sortedItems = [...items].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div className="seller-item-list">
            <header>
                <div className="logo">Assembly Auction</div>
                <button onClick={() => alert('Navigate to Seller Account')}>Account</button>
                <button onClick={() => alert('Viewing My Items')}>My Items</button>
                <button onClick={() => alert('Navigate to Add Item')}>Add Item</button>
            </header>
            <h2>Seller Item List</h2>
            <table>
                <thead>
                    <tr>
                        <th onClick={() => sortItems('itemName')}>Item Name &#8597;</th>
                        <th onClick={() => sortItems('price')}>Price &#8597;</th>
                        <th onClick={() => sortItems('startDate')}>Start Date &#8597;</th>
                        <th onClick={() => sortItems('endDate')}>End Date &#8597;</th>
                        <th onClick={() => sortItems('status')}>Status &#8597;</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedItems.map(item => (
                        <tr key={item.id}>
                            <td>
                                <a href={`/item/${item.id}`}>{item.itemName}</a>
                            </td>
                            <td>${item.price}</td>
                            <td>{item.startDate}</td>
                            <td>{item.endDate}</td>
                            <td>{item.status}</td>
                            <td>
                                <select>
                                    <option>Seller Actions</option>
                                    <option>Publish Item</option>
                                    <option>Unpublish Item</option>
                                    <option>Edit Item</option>
                                    <option>Fulfill Item</option>
                                    <option>Request Item Unfreeze</option>
                                    <option>Archive Item</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SellerItemList;
