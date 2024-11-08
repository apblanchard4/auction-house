"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './reviewItem.css';

interface Item {
    id: number;
    name: string;
    initialPrice: number;
    startDate: string;
    endDate: string;
}

function CustomerReviewItems() {
    const router = useRouter();
    const [items, setItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const fetchItems = async () => {
        try {
            const response = await fetch(
                `https://6haebl2d68.execute-api.us-east-1.amazonaws.com/prod/customerReviewItems`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            const responseData = await response.json();

            if (response.status !== 200) {
                const message = responseData.body ? JSON.parse(responseData.body).message : 'Request failed';
                throw new Error(message);
            }

            const itemsData = responseData;
            if (itemsData.length) {
                setItems(itemsData);
                setFilteredItems(itemsData);
            } else {
                throw new Error('Response body is not an array');
            }

        } catch (err) {
            const typedError = err instanceof Error ? err : new Error('An unknown error occurred');
            setError(typedError.message);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleItemClick = (itemId: number) => {
        router.push(`/viewItem/${itemId}`);
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value.toLowerCase();
        setSearchTerm(searchValue);

        // Filter items based on the search term across all columns
        const filtered = items.filter(item => {
            return (
                (item.name && item.name.toLowerCase().includes(searchValue)) ||
                (item.initialPrice && item.initialPrice.toString().includes(searchValue)) ||
                (item.startDate && item.startDate.toLowerCase().includes(searchValue)) ||
                (item.endDate && item.endDate.toLowerCase().includes(searchValue))
            );
        });
        setFilteredItems(filtered);
    };


    return (
        <div className="seller-review-items">
            <header className="header">
                <h1>Assembly Auction</h1>
                <div className="user-info">
                    <span>Customer</span> | <button onClick={() => router.push('/')}>Create an Account</button>
                </div>
            </header>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Enter text to search"
                    value={searchTerm}
                    onChange={handleSearch}
                />
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
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(filteredItems) && filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <button className="item-name" onClick={() => handleItemClick(item.id)}>
                                        {item.name}
                                    </button>
                                </td>
                                <td>${item.initialPrice}</td>
                                <td>{item.startDate}</td>
                                <td>{item.endDate}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4}>No items found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default CustomerReviewItems;