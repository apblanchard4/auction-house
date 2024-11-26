'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode, JwtPayload } from 'jwt-decode';


interface Item {
    id: string;
    name: string;
    initialPrice: string;
    startDate: string;
    endDate: string;
    status: string;
    image: string;
    description: string;
    currentPrice: number;
    bids: Bid[];
}
interface Bid {
    id: string;
    buyerUsername: string;
    amount: number;
    dateMade: string;
    itemName: string;
    itemId: string;
}

function getUsernameFromToken(idToken: string) {
    if (idToken) {
        const decoded = jwtDecode(idToken);
        return (decoded as JwtPayload & { 'cognito:username': string })['cognito:username'];
    }
    return null;
}

function BuyerPlaceBid() {
    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);
    const [itemId, setItemId] = useState<number | null>(null);
    const [currentCost, setCurrentCost] = useState<number>(0);
    const [lastBidAmount, setLastBidAmount] = useState<number | null>(null);
    const [bidAmount, setBidAmount] = useState<number>(0);

    const placeBid = async () => {
        // Validate bid amount
        if (bidAmount <= currentCost) {
            alert("Bid must be greater than the current cost.");
            return;
        }

        if (lastBidAmount && bidAmount <= lastBidAmount) {
            alert("Bid must be at least $1 higher than the last bid.");
            return;
        }

        // Proceed with placing the bid
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            const response = await fetch(
                `https://it5tog3cy8.execute-api.us-east-1.amazonaws.com/prod/buyer/placeBid`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, itemId, bidAmount }),
                }
            );
            console.log(response);
            if (response.status === 200) {
                alert('Bid placed successfully!');
                router.push('/buyer/reviewItems');
            } else {
                alert('Failed to place bid.');
            }
        } else {
            alert('No token found. Please log in.');
            router.push('/');
        }
    };

    useEffect(() => {
        // Fetch URL params
        const params = new URLSearchParams(window.location.search);
        const itemIdFromUrl = params.get("itemId");
        const currentCostFromUrl = params.get("currentCost");

        if (!itemIdFromUrl) {
            console.error("itemId not found in URL");
            alert('No itemId found in the URL');
            return;
        }

        setItemId(Number(itemIdFromUrl));
        setCurrentCost(Number(currentCostFromUrl) || 0);

        // Set initial bid amount
        setBidAmount(Number(currentCostFromUrl) || 0);

        // Check for idToken to decode username
        const idToken = localStorage.getItem('idToken');
        if (idToken) {
            const decodedUsername = getUsernameFromToken(idToken);
            if (decodedUsername) {
                setUsername(decodedUsername);
            } else {
                alert('Failed to decode token or username not found.');
                router.push('/');
            }
        } else {
            alert('No token found. Please log in.');
            router.push('/');
        }

        // Fetch the last bid to determine the minimum valid bid
        const fetchLastBids = async () => {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                alert("You must log in first.");
                router.push("/");
                return;
            }

            const response = await fetch(`https://2vnz0axf3c.execute-api.us-east-1.amazonaws.com/prod/buyer/viewItems`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            const responseData = await response.json();
            console.log(responseData.statusCode)

            if (responseData.statusCode !== 200) {
                const message = responseData.body ? JSON.parse(responseData.body).message : "Request failed";
                throw new Error(message);
            }

            const items = JSON.parse(responseData.body);


            const item = items.find((item: Item) => item.id === String(itemId));
            if (item) {
                const bids = item.bids || [];
                if (bids.length > 0) {
                    const lastBid = bids[bids.length - 1];  // Get the last bid
                    setLastBidAmount(lastBid.amount);
                    setBidAmount(lastBid.amount + 1);  // Set the bid amount to last bid's amount + 1
                } else {
                    setLastBidAmount(null);  // No bids, so set the last bid amount to null
                    setBidAmount(item.initialPrice);  // Use initial price as the starting point for bidding
                }
            }
        };

        fetchLastBids();
    }, [itemId, currentCost, router]);

    return (
        <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Assembly Auction</h1>
                <div className="text-gray-700">
                    <span className="font-semibold">{username}</span> | <span>Buyer</span>
                </div>
            </header>

            <div className="navigation">
                <button onClick={() => router.push('/buyer/viewAccount')}>Account</button>
                <button className="active" onClick={() => router.push('/buyer/reviewItems')}>My Items</button>
            </div>

            <div className="bg-gray-100 p-6 rounded-md shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Place a Bid</h2>
                <p className="text-gray-600 mb-6">Current Cost: <strong>${currentCost.toFixed(2)}</strong></p>

                <div className="flex flex-col space-y-4">
                    <label htmlFor="bidAmount" className="text-gray-700 font-medium">
                        Enter Your Bid Amount:
                    </label>
                    <input
                        type="number"
                        id="bidAmount"
                        className="border border-gray-300 p-2 rounded-md w-full"
                        value={bidAmount}
                        min={lastBidAmount ? lastBidAmount + 1 : currentCost} // Ensure the bid is greater than the last bid or current cost
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                    />

                    <div className="flex space-x-4">
                        <button
                            onClick={placeBid}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                            Submit Bid
                        </button>
                        <button
                            onClick={() => router.push(`/buyer/viewItem?itemId=${itemId}`)}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BuyerPlaceBid;
