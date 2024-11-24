"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode, JwtPayload } from "jwt-decode";
import "./addItem.css";

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
}

function AddItem() {
    const router = useRouter();
    
    const [item, setItem] = useState<Item>({
        id: "",
        name: "",
        initialPrice: "",
        startDate: "",
        endDate: "",
        length: "",
        status: "inactive",
        image: "",
        description: "",
    });

    const [username, setUsername] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null); // Add this state

    // Fetch username from token when component mounts
    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            alert("You must log in first.");
            router.push("/");
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
        }, [router]);

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setItem((prevItem) => ({
            ...prevItem,
            [name]: value,
        }));
    }


    async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;
      
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          alert("You must log in first.");
          return;
        }
      
        try {
          // Request a pre-signed URL from the backend
          const response = await fetch(
            "https://auctionhousec0fa4b6d5a2641a187df78aa6945b28f5f64c-prod.s3.amazonaws.com/seller/getPresignedURL",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ fileName: file.name }),
            }
          );
      
          if (!response.ok) {
            throw new Error("Failed to get presigned URL.");
          }
      
          const { presignedUrl, fileUrl } = await response.json();
      
          // Upload the file to S3
          await fetch(presignedUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
          });
      
          alert("Image uploaded successfully.");
          // Save the file URL for later use (e.g., as part of the item data)
          setImageUrl(fileUrl); // Save the public S3 URL for this image
        } catch (error) {
          console.error("Error uploading image:", error);
          alert("Image upload failed.");
        }
      }
      
    // Handle add item action
    async function handleAction() {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            alert("You must log in first.");
            router.push("/");
            return;
        }
        
        if (!item.name || !item.initialPrice || !item.length || !item.description || !imageUrl) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            const response = await fetch(
                "https://qbylae5by7.execute-api.us-east-1.amazonaws.com/prod/selleraddItem-prod", // Change API endpoint for adding
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        sellerUsername: username,
                        itemName: item.name,
                        itemDescription: item.description,
                        itemPrice: item.initialPrice,
                        itemLength: item.length,
                        itemImage: imageUrl, // Use the uploaded image URL
                    }),
                }
            );

            if (response.ok) {
                alert("Item added successfully!");
                setItem({  // Reset form after successful submission
                    id: "",
                    name: "",
                    initialPrice: "",
                    startDate: "",
                    endDate: "",
                    length: "",
                    status: "inactive",
                    image: "",
                    description: "",
                });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add item.");
            }
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert("An error occurred while adding the item.");
            }
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
                        // src={item.image} // Optionally use item image if applicable
                        className="w-full max-w-md rounded-lg shadow-md mb-6 justify-self-center"
                    />
                    <div className="flex justify-end w-full">
                        <button className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition add-button" onClick={handleAction}>
                            Add Item
                        </button>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex flex-col">
                    <input
                        id="itemName"
                        name="name"
                        type="text"
                        value={item.name}
                        onChange={handleInputChange}
                        className="text-xl font-semibold mb-2"
                        placeholder="Item Name"
                    />
                    <input
                        id="itemDescription"
                        name="description"
                        type="text"
                        value={item.description}
                        onChange={handleInputChange}
                        className="text-gray-700 mb-4"
                        placeholder="Item Description"
                    />
                    <div>
                        <span className="font-semibold">Start Price: </span>
                        <input
                            id="itemPrice"
                            name="initialPrice"
                            type="text"
                            value={item.initialPrice}
                            onChange={handleInputChange}
                            className="font-semibold"
                            placeholder="Item Price (>=$1)"
                        />
                    </div>
                    <div>
                        <span className="font-semibold">Auction Length: </span>
                        <input
                            id="length"
                            name="length"
                            type="text"
                            value={item.length}
                            onChange={handleInputChange}
                            className="font-semibold"
                            placeholder="Auction Length (days)"
                        />
                    </div>
                    <span className="font-semibold image-label">Input Image URL: </span>
                        <input
                             type="file"
                             accept="image/*"
                             onChange={handleImageUpload}
                             className="image-field"
                        />
                    <div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddItem;

