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
    const [sortConfig, setSortConfig] = useState<{ key: keyof Item; direction: 'ascending' | 'descending' } | null>(null);

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
            if (Array.isArray(itemsData)) {
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

    useEffect(() => {
        const filtered = items.filter(item => {
            return (
                (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.initialPrice && item.initialPrice.toString().includes(searchTerm)) ||
                (item.startDate && item.startDate.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.endDate && item.endDate.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        });
        setFilteredItems(filtered);
    }, [searchTerm, items]);

    const handleItemClick = (itemId: number) => {
        router.push(`/viewItem/${itemId}`);
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value); // Update search term on change
    };

    const handleSort = (key: keyof Item) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });

        const sortedItems = [...filteredItems].sort((a, b) => {
            if (a[key] < b[key]) {
                return direction === 'ascending' ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        setFilteredItems(sortedItems);
    };

    const getSortArrow = (key: keyof Item) => {
        if (!sortConfig || sortConfig.key !== key) return '⇅';
        return sortConfig.direction === 'ascending' ? '↑' : '↓';
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
                        <th onClick={() => handleSort('initialPrice')}>
                            Price <span className="sort-arrows">{getSortArrow('initialPrice')}</span>
                        </th>
                        <th onClick={() => handleSort('startDate')}>
                            Start Date <span className="sort-arrows">{getSortArrow('startDate')}</span>
                        </th>
                        <th onClick={() => handleSort('endDate')}>
                            End Date <span className="sort-arrows">{getSortArrow('endDate')}</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.length > 0 ? (
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
