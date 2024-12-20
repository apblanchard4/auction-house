"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./sellerViewAccount.css";
import { jwtDecode, JwtPayload } from "jwt-decode";

// Helper to decode the username from the token
function getUsernameFromToken(idToken: string) {
  if (idToken) {
    const decoded = jwtDecode(idToken);
    return (decoded as JwtPayload & { "cognito:username": string })["cognito:username"];
  }
  return null;
}

const SellerAccountPage: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  //const [balance] = useState<string>("$X.XX"); // Placeholder balance
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountData = async (user: string) => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("You must log in first.");
        router.push("/");
        return;
      }

      console.log(user); //TODO: Get rid of after fetch balance implementation

    };

    const idToken = localStorage.getItem("idToken");
    if (idToken) {
      const decodedUsername = getUsernameFromToken(idToken);
      if (decodedUsername) {
        setUsername(decodedUsername);
        fetchAccountData(decodedUsername);
      } else {
        alert("Failed to decode token or username not found.");
        router.push("/");
      }
    } else {
      alert("No token found. Please log in.");
      router.push("/");
    }
  }, [router]);

  const handleCloseAccount = async () => {
    const password = prompt("Enter your password to confirm:");
    if (!password) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("You must log in first.");
      router.push("/");
      return;
    }

    try {
      const response = await fetch("https://i7n2snzpg5.execute-api.us-east-1.amazonaws.com/prod/seller/closeAccount", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, password: password }),
      });

      const result = await response.json();
      if (result.statusCode === 200) {
        setMessage("Account successfully closed.");
        router.push("/");

      } else {
        setMessage(result.message || "Failed to close account.");
      }
    } catch {
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Assembly Auction</h1>
        <div className="text-gray-700">
          <span className="font-semibold">{username}</span> | <span>Seller</span>
        </div>
      </header>

      <div className="navigation">
        <button className="active" onClick={() => router.push('/seller/viewAccount')}>Account</button>
        <button onClick={() => router.push('/seller/reviewItems')}>My Items</button>
        <button onClick={() => router.push('/seller/addItem')}>Add Item</button>
      </div>

      <main>
        <h1>Manage Profile</h1>
        <div className="content">
          <button className="close-account-button" onClick={handleCloseAccount}>
            Close Account
          </button>
        </div>

        {message && <div className="message">{message}</div>}
      </main>
    </div>
  );
};

export default SellerAccountPage;