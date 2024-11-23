"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { jwtDecode, JwtPayload } from "jwt-decode";
import "./placeBid.css";

// Helper function to extract username from token
function getUsernameFromToken(idToken: string) {
    if (idToken) {
        const decoded = jwtDecode<JwtPayload & { "cognito:username": string }>(idToken);
        return decoded["cognito:username"];
    }
    return null;
}

function PlaceBid() {
    const router = useRouter();
    const searchParams = useSearchParams(); // Access query parameters
    const [itemId, setItemId] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [bidAmount, setBidAmount] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const itemIdFromQuery = searchParams.get("itemId");
        if (itemIdFromQuery) {
            setItemId(itemIdFromQuery);
        } else {
            alert("Item ID not found in query parameters.");
            router.push("/"); // Redirect to the home page if no itemId
            return;
        }

        const idToken = localStorage.getItem("idToken");
        if (idToken) {
            const decodedUsername = getUsernameFromToken(idToken);
            if (decodedUsername) {
                setUsername(decodedUsername);
            } else {
                alert("Invalid token.");
                router.push("/");
            }
        } else {
            alert("You must log in first.");
            router.push("/");
        }
    }, [router, searchParams]);

    const handlePlaceBid = async () => {
        if (!itemId || !username || !bidAmount) {
            setError("All fields are required.");
            return;
        }

        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            alert("You must log in first.");
            router.push("/");
            return;
        }

        try {
            const response = await fetch(
                "https://ey7y9g41al.execute-api.us-east-1.amazonaws.com/prod/buyer/placeBid",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        itemId,
                        buyerUsername: username,
                        amount: bidAmount,
                    }),
                }
            );

            const responseData = await response.json();
            if (response.ok) {
                alert("Bid placed successfully!");
                router.push(`/buyer/viewItem?itemId=${itemId}`);
            } else {
                throw new Error(responseData.message || "Failed to place bid");
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message || "An error occurred while placing the bid.");
            } else {
                setError("An error occurred while placing the bid.");
            }
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Place Your Bid</h1>
                <div className="text-gray-700">
                    <span className="font-semibold">{username}</span>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-col gap-6">
                {error && (
                    <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg p-4">
                        {error}
                    </div>
                )}

                <div>
                    <label htmlFor="bidAmount" className="block text-lg font-semibold text-gray-700">
                        Bid Amount
                    </label>
                    <input
                        type="number"
                        id="bidAmount"
                        value={bidAmount ?? ""}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        className="mt-2 p-2 border border-gray-300 rounded-lg w-full"
                        placeholder="Enter your bid amount"
                    />
                </div>

                <button
                    onClick={handlePlaceBid}
                    className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
                >
                    Submit Bid
                </button>

                <button
                    onClick={() => router.push(`/buyer/viewItem?itemId=${itemId}`)}
                    className="py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default PlaceBid;
