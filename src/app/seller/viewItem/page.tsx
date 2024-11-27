"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode, JwtPayload } from "jwt-decode";
import "./sellerViewItem.css";

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
    status: string;
    length: string;
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

function SellerViewItem() {
    const router = useRouter();
    const [itemId, setItemId] = useState<string | null>(null);
    const [item, setItem] = useState<Item | null>(null);
    const [username, setUsername] = useState<string | null>(null);

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
                        "https://lpr8qgd76a.execute-api.us-east-1.amazonaws.com/prod/seller/viewItem",
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
                    console.log(responseData);
                    if (response.ok) {
                        const itemData = JSON.parse(responseData.body)[0];
                        if (itemData) {
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
                } catch {
                    alert("An error occurred while fetching the item.");
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
            case "edit":
                if (item.status === "inactive") {
                    router.push(`/seller/editItem?itemId=${item.id}`);

                  } else {
                    alert("Item is already active and cannot be edited");
                  }
                  break;

            case "publish":
                if (item.status !== "inactive") {
                    alert("Item is already published.");
                    return;
                }

                try {
                    const response = await fetch(
                        `https://t033iv5klk.execute-api.us-east-1.amazonaws.com/prod/sellerpublishItem-prod`,
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
                        alert("Item published successfully.");
                    } else {
                        const result = await response.json();
                        alert(result.message || "Failed to publish item.");
                    }
                } catch {
                    alert("An error occurred while publishing the item.");
                }
                break;

            default:
                alert("Invalid action.");
        }
    }

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
                    <div className="grid grid-cols-3 gap-2 w-full">
                        <button className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition" onClick={() => handleAction("edit")}>
                            Edit
                        </button>
                        <button className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition" onClick={() => handleAction("publish")}>
                            Publish
                        </button>
                        <button className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition" onClick={() => handleAction("unpublish")}>
                            Unpublish
                        </button>
                        <button className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition" onClick={() => handleAction("fufill")}>
                            Fulfill
                        </button>
                        <button className="py-2 px-4 bg-gray-700 text-white rounded-lg  hover:bg-gray-800 transition" onClick={() => handleAction("unfreeze")}>
                            Unfreeze
                        </button>
                        <button className="py-2 px-4 bg-gray-700 text-white rounded-lg  hover:bg-gray-800 transition" onClick={() => handleAction("archive")}>
                            Archive
                        </button>
                    </div>
                </div>

                {/* Right Section */}
                <div className="lg:w-1/2">
                    <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
                    <p className="text-gray-700 mb-4">{item.description}</p>
                    <div>
                        <span className="font-semibold">Price:</span> {item.initialPrice}
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

                    <h3 className="text-xl font-semibold text-gray-700 mt-8 mb-3">Bids</h3>
                    <div className="space-y-4">
                        {item.bids.map((bid) => (
                            <div key={bid.id} className="bg-white rounded-lg shadow-md p-4">
                                <p>
                                    <strong>Bidder:</strong> {bid.buyerUsername}
                                </p>
                                <p>
                                    <strong>Amount:</strong> ${bid.amount}
                                </p>
                                <p>
                                    <strong>Date:</strong> {bid.dateMade}

                                </p>
                                <p>
                                    <strong>Price:</strong> {Number(bid.amount) + Number(item.initialPrice)}

                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div >
    );
}

export default SellerViewItem;
