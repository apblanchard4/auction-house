"use client";
import AWS from 'aws-sdk';

import React, { useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { jwtDecode, JwtPayload } from "jwt-decode";
import "./addItem.css";

// Set IAM credentials directly (use environment variables for security in production)
AWS.config.update({
    accessKeyId: 'AKIAVA5YLASV53SUDUHJ',  // Replace with your AWS Access Key ID
    secretAccessKey: 'YphhxMOShK4Gntaa99TsN2n/kX0CTlhInrws3JJV',  // Replace with your AWS Secret Access Key
    region: 'us-east-1',  // The region of your S3 bucket
});

const s3 = new AWS.S3();

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

    // Handle image upload
    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files ? e.target.files[0] : null;

        if (!file) {
            alert("No file selected.");
            return;
        }

        const fileName = `${username}-${Date.now()}-${file.name}`; // Unique file name
        const bucketName = "auctionhousec0fa4b6d5a2641a187df78aa6945b28f5f64c-prod"; // Replace with your bucket name
        const region = "us-east-1"; // Replace with your AWS region (e.g., us-east-1)
        const params = {
            Bucket: bucketName,
            Key: `uploads/images/${fileName}`,
            Body: file,
            ContentType: file.type, // Ensure correct file type
        };

        try {
            // Upload the file to S3
            const uploadResult = await s3.upload(params).promise();

            // Construct the S3 URI
            const s3Uri = `s3://${bucketName}/uploads/images/${fileName}`;

            // Set the image URL to the S3 URI
            setImageUrl(s3Uri);
            alert("Image uploaded successfully!");
        } catch (error) {
            console.error("Error uploading image to S3:", error);
            alert("Failed to upload image.");
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

        const initialPrice = parseFloat(item.initialPrice);
        if (isNaN(initialPrice) || initialPrice < 1) {
            alert("Initial price must be a valid number greater than or equal to $1.");
            return;
        }

        // Validate length
        const auctionLength = parseInt(item.length);
        if (isNaN(auctionLength) || auctionLength < 1) {
            alert("Auction length must be a valid number and at least 1 day.");
            return;
        }

        try {
            const response = await fetch(
                "https://1tlepvbqtd.execute-api.us-east-1.amazonaws.com/prod/seller/addItem",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        sellerUsername: username,
                        newName: item.name,
                        newDescription: item.description,
                        initialPrice: item.initialPrice,
                        newLength: item.length,
                        newImage: imageUrl, // Use the uploaded image URL
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
                router.push("/seller/reviewItems");
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
                <button className="active" onClick={() => router.push("/seller/addItem")}>Add Item</button>
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

