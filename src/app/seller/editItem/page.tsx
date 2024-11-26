"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode, JwtPayload } from "jwt-decode";
import "./sellerEditItem.css";

// Helper function to extract username from token
function getUsernameFromToken(idToken: string) {
    if (idToken) {
        const decoded = jwtDecode<JwtPayload & { "cognito:username": string }>(idToken);
        return decoded["cognito:username"];
    }
    return null;
}

interface Item {
    id: string;
    name: string;
    initialPrice: string;
    startDate: string;
    endDate: string;
    length: string;
    status: string;
    image: string;
    description: string;
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

function SellerEditItem() {
    const router = useRouter();
    const [itemId, setItemId] = useState<string | null>(null);
    const [item, setItem] = useState<Item | null>(null);
    const [username, setUsername] = useState<string | null>(null);

    // Get itemId from search params (only in client-side)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const itemIdFromUrl = params.get("itemId");
        setItemId(itemIdFromUrl);
    }, []);

    // Fetch item data
    useEffect(() => {
        if (itemId) {
            async function fetchData(user: string, itemId: string) {
                const accessToken = localStorage.getItem("accessToken");
                if (!accessToken) {
                    alert("You must log in first.");
                    router.push("/");
                    return;
                }

                try {
                    const response = await fetch(
                        "https://6o8yalu42b.execute-api.us-east-1.amazonaws.com/prod/seller/viewItem",
                        {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ sellerUsername: user, itemId }),
                        }
                    );

                    const responseData = await response.json();
                    if (response.ok) {
                        const itemData = JSON.parse(responseData.body)[0];
                        if (itemData) {
                            // Replace S3 URL with public URL
                            itemData.image = itemData.image.replace(
                                "s3://",
                                "https://auctionhousec0fa4b6d5a2641a187df78aa6945b28f5f64c-prod.s3.amazonaws.com/"
                            );
                            setItem(itemData);
                        } else {
                            throw new Error("Item not found");
                        }
                    } else {
                        throw new Error(responseData.message || "Failed to fetch item data");
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        alert(error.message || "An error occurred while fetching the item.");
                    } else {
                        alert("An error occurred while fetching the item.");
                    }
                }
            }

            const idToken = localStorage.getItem("idToken");
            if (idToken) {
                const decodedUsername = getUsernameFromToken(idToken);
                if (decodedUsername) {
                    setUsername(decodedUsername);
                    fetchData(decodedUsername, itemId);
                } else {
                    alert("Invalid token.");
                    router.push("/");
                }
            } else {
                alert("You must log in first.");
                router.push("/");
            }
        }
    }, [itemId, router]);

    if (!item) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    function setItemName(name: string) {
        setItem((prevItem) => prevItem ? { ...prevItem, name } : null);
    }

    function setItemDescription(description: string) {
        setItem((prevItem) => prevItem ? { ...prevItem, description } : null);
    }

    function setItemPrice(price: string) {
        setItem((prevItem) => prevItem ? { ...prevItem, initialPrice: price } : null);
    }

    function setItemLength(length: string) {
        setItem((prevItem) => prevItem ? { ...prevItem, length } : null);
    }

    // Handle actions
    async function handleAction(action: string) {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            alert("You must log in first.");
            router.push("/");
            return;
        }
        if (!item) {
            alert("Item data not found.");
            return;
        }

        // Perform the specified action based on the button clicked
        switch (action) {
            case "Save":
                console.log("Payload:", {
                    sellerUsername: username,
                    itemId: item.id,
                    newName: item.name,
                    newDescription: item.description,
                    newPrice: item.initialPrice,
                    newLength: item.length,
                  });
                try {
                    const response = await fetch(
                        "https://qbylae5by7.execute-api.us-east-1.amazonaws.com/prod/seller/editItem", 
                        {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                sellerUsername: username,
                                itemId: item.id,
                                newName: item.name,
                                newDescription: item.description,
                                newPrice: item.initialPrice,
                                newLength: item.length,
                            }),
                        }
                    );
                    if (response.ok) {
                        alert("Changes saved successfully.");
                        console.log("Post Save:", {
                            sellerUsername: username,
                            itemId: item.id,
                            newName: item.name,
                            newDescription: item.description,
                            newPrice: item.initialPrice,
                            newLength: item.length,
                          });
                        router.push(`/seller/viewItem?itemId=${item.id}`);
                    } else {
                        const errorData = await response.json();
                        throw new Error(errorData.message || "Failed to save changes.");
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        alert(error.message);
                    } else {
                        alert("An error occurred while saving changes.");
                    }
                }
                break;
        }
    }
    console.log("Fetched item:", item);

    return (
        <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Assembly Auction</h1>
                <div className="text-gray-700">
                    <span className="font-semibold">{username}</span> | <span>Seller</span>
                </div>
            </header>

            {/* Navigation */}
            <div className="navigation">
                <button onClick={() => router.push("/seller/viewAccount")}>Account</button>
                <button onClick={() => router.push("/seller/reviewItems")}>My Items</button>
                <button onClick={() => router.push("/seller/addItem")}>Add Item</button>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Section */}
                <div className="lg:w-1/2">
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full max-w-md rounded-lg shadow-md mb-6 justify-self-center"
                    />
                    <div className="flex justify-end w-full">
                        <button className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition save-button" onClick={() => handleAction("Save")}>
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex flex-col">
                    <input
                        id="itemName" 
                        type="text" 
                        value={item.name} 
                        onChange={(e) => setItemName(e.target.value)} 
                        className="text-xl font-semibold mb-2"
                    />
                    <input
                        id="itemDescription" 
                        type="text" 
                        value={item.description} 
                        onChange={(e) => setItemDescription(e.target.value)} 
                        className="text-gray-700 mb-4"
                    />
                    <div>
                        <span className="font-semibold">Price: </span>
                        <input
                        id="itemPrice" 
                        type="text" 
                        value={item.initialPrice} 
                        onChange={(e) => setItemPrice(e.target.value)} 
                        className="font-semibold"
                    />
                    </div>
                    <div>
                        <span className="font-semibold">Auction Length: </span>
                        <input
                        id="length" 
                        type="text" 
                        value={item.length} 
                        onChange={(e) => setItemLength(e.target.value)} 
                        className="font-semibold"
                    />
                    </div>
                    <div>
                        <span className="font-semibold">Start Date:</span> {item.startDate}
                    </div>
                    <div>
                        <span className="font-semibold">End Date:</span> {item.endDate}
                    </div>
                    <div>
                        <span className="font-semibold">Status:</span> {item.status}
                    </div>
                </div>
            </div>
        </div >
    );
}

export default SellerEditItem;
