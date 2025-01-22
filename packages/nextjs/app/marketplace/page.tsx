"use client";

import { useState } from "react";
import { useScaffoldReadContract, useScaffoldWriteContract } from "../../hooks/scaffold-eth";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";

enum TokenType {
  FUNGIBLE,
  NON_FUNGIBLE,
}

interface Listing {
  listingId: bigint;
  seller: string;
  tokenAddress: string;
  tokenType: TokenType;
  tokenId: bigint;
  quantity: bigint;
  price: bigint;
  active: boolean;
}

export default function Marketplace() {
  const { address } = useAccount();
  const [newListing, setNewListing] = useState({
    tokenAddress: "",
    tokenType: TokenType.FUNGIBLE,
    tokenId: "0",
    quantity: "1",
    price: "",
  });

  // Contract Hooks
  const { data: listings = [] } = useScaffoldReadContract({
    contractName: "Marketplace",
    functionName: "getListings",
  });

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "Marketplace",
  });

  const handleListToken = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await writeContractAsync({
        args: [
          newListing.tokenAddress,
          newListing.tokenType,
          BigInt(newListing.tokenId),
          BigInt(newListing.quantity),
          parseEther(newListing.price),
        ],
        functionName: "listToken",
      });
      notification.success("Token listed successfully!");
    } catch (error) {
      console.error("Error listing token:", error);
      notification.error("Failed to list token");
    }
  };

  const handleBuyToken = async (listingId: bigint, price: bigint, quantity: bigint) => {
    try {
      await writeContractAsync({
        args: [listingId, quantity],
        value: price * quantity,
        functionName: "buyToken",
      });
      notification.success("Token purchased successfully!");
    } catch (error) {
      console.error("Error buying token:", error);
      notification.error("Failed to buy token");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Token Marketplace</h1>

      {/* List Token Form */}
      <div className="bg-base-200 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">List Token</h2>
        <form onSubmit={handleListToken} className="space-y-4">
          <div>
            <label className="label">Token Address</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={newListing.tokenAddress}
              onChange={e => setNewListing(prev => ({ ...prev, tokenAddress: e.target.value }))}
              placeholder="0x..."
            />
          </div>
          <div>
            <label className="label">Token Type</label>
            <select
              className="select select-bordered w-full"
              value={newListing.tokenType}
              onChange={e => setNewListing(prev => ({ ...prev, tokenType: Number(e.target.value) }))}
            >
              <option value={TokenType.FUNGIBLE}>Fungible Token</option>
              <option value={TokenType.NON_FUNGIBLE}>Non-Fungible Token</option>
            </select>
          </div>
          {newListing.tokenType === TokenType.NON_FUNGIBLE && (
            <div>
              <label className="label">Token ID</label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={newListing.tokenId}
                onChange={e => setNewListing(prev => ({ ...prev, tokenId: e.target.value }))}
              />
            </div>
          )}
          <div>
            <label className="label">Quantity</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={newListing.quantity}
              onChange={e => setNewListing(prev => ({ ...prev, quantity: e.target.value }))}
              min="1"
            />
          </div>
          <div>
            <label className="label">Price (ETH)</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={newListing.price}
              onChange={e => setNewListing(prev => ({ ...prev, price: e.target.value }))}
              step="0.000000000000000001"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            List Token
          </button>
        </form>
      </div>

      {/* Active Listings */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Active Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing: Listing) => (
            <div
              key={listing.listingId.toString()}
              className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-200"
            >
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <h3 className="card-title text-xl">
                    {listing.tokenType === TokenType.FUNGIBLE ? "Fungible Token" : "NFT"}
                    <span className="text-sm text-primary">#{listing.listingId.toString()}</span>
                  </h3>
                  <div className="badge badge-secondary">{listing.tokenType === TokenType.FUNGIBLE ? "FT" : "NFT"}</div>
                </div>

                <div className="space-y-2 my-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm opacity-70">Seller:</span>
                    <span className="text-sm font-mono">{`${listing.seller.slice(0, 6)}...${listing.seller.slice(-4)}`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm opacity-70">Token:</span>
                    <span className="text-sm font-mono">{`${listing.tokenAddress.slice(0, 6)}...${listing.tokenAddress.slice(-4)}`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm opacity-70">Token ID:</span>
                    <span className="text-sm">{listing.tokenId.toString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm opacity-70">Quantity:</span>
                    <span className="text-sm">{listing.quantity.toString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="text-xl font-bold text-primary">{formatEther(listing.price)} ETH</div>
                  {listing.active && listing.seller !== address && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleBuyToken(listing.listingId, listing.price, listing.quantity)}
                    >
                      Buy Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
