"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./buyerViewAccount.css";
import { jwtDecode, JwtPayload } from "jwt-decode";

function getUsernameFromToken(idToken: string) {
  if (idToken) {
    const decoded = jwtDecode(idToken);
    return (decoded as JwtPayload & { "cognito:username": string })["cognito:username"];
  }
  return null;
}

interface Bid {
    itemName: string;
    amount: number;
}

interface Purchase {
    itemName: string;
    amount: number;
}

const BuyerAccountPage: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("$X.XX");
  const [activeBids, setActiveBids] = useState<Bid[]>([]); // Placeholder for active bids (next iteration)
  const [purchases, setPurchases] = useState<Purchase[]>([]); // Placeholder for purchases (next iteration)
  const [message, setMessage] = useState<string | null>(null);
  const [fundsToAdd, setFundsToAdd] = useState<string>("");

  useEffect(() => {
    const idToken = localStorage.getItem("idToken");
    if (idToken) {
      const decodedUsername = getUsernameFromToken(idToken);
      if (decodedUsername) {
        setUsername(decodedUsername);
        fetchAccountBalance(decodedUsername);
        fetchActiveBids(decodedUsername);
        fetchPurchases(decodedUsername);
      } else {
        alert("Failed to decode token or username not found.");
        router.push("/");
      }
    } else {
      alert("No token found. Please log in.");
      router.push("/");
    }
  }, [router]);

  const fetchAccountBalance = async (user: string) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("You must log in first.");
      router.push("/");
      return;
    }

    try {
      const response = await fetch(
        "https://ubi8lbuq3e.execute-api.us-east-1.amazonaws.com/prod/buyer/getFunds",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            body: JSON.stringify({ username: user }), 
          }),        }
      );

      const result = await response.json();
      if (response.ok) {
        const parsedBody = JSON.parse(result.body);
  
        const parsedFunds = parseFloat(parsedBody.funds);
        if (!isNaN(parsedFunds)) {
          setBalance(`$${parsedFunds.toFixed(2)}`); 
        } else {
          setMessage("Invalid funds value received from the server.");
        }
      } else {
        setMessage(result.message || "Failed to fetch account balance.");
      }
    } catch (error) {
      console.error("Error fetching account balance:", error);
      setMessage("An error occurred while fetching account balance.");
    }
  };

  // Fetch active bids (placeholder for next iteration)
  const fetchActiveBids = async (user: string) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("You must log in first.");
      router.push("/");
      return;
    }
    console.log(user);
    try {
      // Placeholder logic until next iteration
      const mockBids = [
        { itemName: "Mock Item A", amount: 45.99 },
        { itemName: "Mock Item B", amount: 75.5 },
      ];
      setActiveBids(mockBids);

      // Uncomment and replace with lambda in next iteration
      /*
      const response = await fetch(
        "https://your-lambda-endpoint/buyer/getActiveBids",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: user }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        setActiveBids(result.activeBids || []);
      } else {
        setMessage(result.message || "Failed to fetch active bids.");
      }
      */
    } catch {
      setMessage("An error occurred while fetching active bids.");
    }
  };

  // Fetch purchases (full implementation in next iteration)
  const fetchPurchases = async (user: string) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("You must log in first.");
      router.push("/");
      return;
    }
    console.log(user);
    try {
      // Placeholder logic until next iteration
      const mockPurchases = [
        { itemName: "Mock Item C", amount: 120.0 },
        { itemName: "Mock Item D", amount: 250.0 },
      ];
      setPurchases(mockPurchases);

      // Uncomment and replace with lambda in next iteration
      /*
      const response = await fetch(
        "https://your-lambda-endpoint/buyer/getPurchases",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: user }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        setPurchases(result.purchases || []);
      } else {
        setMessage(result.message || "Failed to fetch purchases.");
      }
      */
    } catch {
      setMessage("An error occurred while fetching purchases.");
    }
  };

  const handleAddFunds = async () => {
    if (!fundsToAdd || isNaN(Number(fundsToAdd))) {
      alert("Please enter a valid amount.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("You must log in first.");
      router.push("/");
      return;
    }

    try {
        const response = await fetch("https://dkmbcx22k0.execute-api.us-east-1.amazonaws.com/prod/buyer/addFunds", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              body: JSON.stringify({ username: username, amount: Number(fundsToAdd) }) 
            }),
          });

      const result = await response.json();
      if (response.ok) {
        const parsedBody = JSON.parse(result.body);
        
        const newFunds = parseFloat(parsedBody.newFunds);
        if (!isNaN(newFunds)) {
          setBalance(`$${newFunds.toFixed(2)}`); 
          setFundsToAdd(""); 
        } else {
          setMessage("Invalid funds value received from the server.");
        }
      } else {
        setMessage(result.message || "Failed to add funds.");
      }
    } catch (error) {
      console.error("Error adding funds:", error);
      setMessage("An error occurred while adding funds.");
    }
  };
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
      const response = await fetch("https://vrfs65il1l.execute-api.us-east-1.amazonaws.com/prod/buyer/closeAccount", {
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
          <span className="font-semibold">{username}</span> | <span>Buyer</span>
        </div>
      </header>

      <div className="navigation">
        <button className="active" onClick={() => router.push("/buyer/viewAccount")}>
          Account
        </button>
        <button onClick={() => router.push("/buyer/reviewItems")}>My Items</button>
      </div>

      <main>
        <h1>Manage Profile</h1>
        <div className="content">
          <div className="account-section">
            <h2>Current Account Balance</h2>
            <p>{balance}</p>
            <h3>Add Funds</h3>
            <input
              type="text"
              value={fundsToAdd}
              onChange={(e) => setFundsToAdd(e.target.value)}
              placeholder="Enter amount"
            />
            <button onClick={handleAddFunds}> Submit</button>
          </div>

          <div className="active-bids-section">
            <h2>Active Bids</h2>
            {activeBids.length > 0 ? (
              activeBids.map((bid, index) => (
                <p key={index}>
                  {bid.itemName} - ${bid.amount.toFixed(2)}
                </p>
              ))
            ) : (
              <p>No active bids at the moment.</p>
            )}
          </div>

          <div className="purchases-section">
            <h2>Review Purchases</h2>
            {purchases.length > 0 ? (
              purchases.map((purchase, index) => (
                <p key={index}>
                  {purchase.itemName} - ${purchase.amount.toFixed(2)}
                </p>
              ))
            ) : (
              <p>No purchases to review at the moment.</p>
            )}
          </div>

          <button className="close-account-button" onClick={handleCloseAccount}>
            Close Account
          </button>
        </div>

        {message && <div className="message">{message}</div>}
      </main>
    </div>
  );
};

export default BuyerAccountPage;