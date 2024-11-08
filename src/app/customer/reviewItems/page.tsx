"use client";
import React, { useEffect, useState, useMemo } from 'react';
import './reviewItem.css';

interface Item {
    id: number;
    name: string;
    initialPrice: string;
    startDate: string;
    endDate: string;
    image: string;
    description: string;
}

function CustomerReviewItems() {
    const [items, setItems] = useState<Item[]>([]);
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
            console.log("Response data:", responseData);

            if (response.status !== 200) {
                const message = responseData.body ? JSON.parse(responseData.body).message : 'Request failed';
                throw new Error(message);
            }

            const itemsData = responseData;
            if (itemsData.length) {
                const updatedItems = itemsData.map((item: Item) => ({
                    ...item,
                    image: item.image.replace('s3://', 'https://auctionhousec0fa4b6d5a2641a187df78aa6945b28f5f64c-prod.s3.amazonaws.com/')
                }));
                setItems(updatedItems);
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

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSort = (key: keyof Item) => {
        setSortConfig(prevSortConfig => ({
            key,
            direction: prevSortConfig?.key === key
                ? prevSortConfig.direction === 'ascending' ? 'descending' : 'ascending'
                : 'ascending' // Set ascending for new key
        }));
    };

    const sortItems = (array: Item[], key: keyof Item, direction: 'ascending' | 'descending') => {
        return array.sort((a, b) => {
            let comparisonResult = 0;

            const aValue = a[key];
            const bValue = b[key];

            if (key === 'initialPrice') {
                const aPrice = parseFloat(aValue as string);
                const bPrice = parseFloat(bValue as string);
                comparisonResult = aPrice - bPrice;
            }
            else if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparisonResult = aValue.localeCompare(bValue);
            }
            else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparisonResult = aValue - bValue;
            }
            else if (typeof aValue === 'string' && typeof bValue === 'string' && Date.parse(aValue) && Date.parse(bValue)) {
                const aDate = new Date(aValue).getTime();
                const bDate = new Date(bValue).getTime();
                comparisonResult = aDate - bDate;
            }

            // Reverse the comparison if descending
            if (direction === 'descending') {
                comparisonResult = -comparisonResult;
            }

            return comparisonResult;
        });
    };


    const filteredAndSortedItems = useMemo(() => {
        let filtered = items;

        // Filter items based on the search term
        if (searchTerm) {
            const searchValue = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchValue) ||
                item.initialPrice.toString().includes(searchValue) ||
                item.startDate.toLowerCase().includes(searchValue) ||
                item.endDate.toLowerCase().includes(searchValue) ||
                item.description.toLowerCase().includes(searchValue)
            );
        }

        console.log("Filtered items:", filtered);

        // Sort items based on sortConfig
        if (sortConfig) {
            const { key, direction } = sortConfig;
            console.log(`Sorting by column: ${key} in ${direction} order`);

            // Use the sortItems function to sort the list
            filtered = sortItems(filtered, key, direction);
        }

        return filtered;
    }, [items, searchTerm, sortConfig]);

    return (
        <div className="seller-review-items">
            <header className="header">
                <h1>Assembly Auction</h1>
                <div className="user-info">
                    <span>Customer</span> | <button>Create an Account</button>
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
                        <th>Image</th>
                        <th>Item Name</th>
                        <th onClick={() => handleSort('initialPrice')}>Price <span className="sort-arrows">⇅</span></th>
                        <th onClick={() => handleSort('startDate')}>Start Date <span className="sort-arrows">⇅</span></th>
                        <th onClick={() => handleSort('endDate')}>End Date <span className="sort-arrows">⇅</span></th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAndSortedItems.length > 0 ? (
                        filteredAndSortedItems.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <img src={item.image} alt={item.name} className="item-image" />
                                </td>
                                <td>{item.name}</td>
                                <td>${item.initialPrice}</td>
                                <td>{item.startDate}</td>
                                <td>{item.endDate}</td>
                                <td>{item.description}</td>
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

export default CustomerReviewItems;
