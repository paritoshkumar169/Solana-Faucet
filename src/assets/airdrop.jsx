import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export function Airdrop() {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [balance, setBalance] = useState(0);
    const [status, setStatus] = useState('');
    const [lastAirdropTime, setLastAirdropTime] = useState(0);

    useEffect(() => {
        if (publicKey) {
            updateBalance(publicKey);
        }
    }, [publicKey, connection]);

    async function updateBalance(publicKey) {
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
    }

    async function handleAirdrop() {
        if (!publicKey) {
            setStatus('Please connect your wallet first.');
            return;
        }

        const currentTime = Date.now();
        if (currentTime - lastAirdropTime < 24 * 60 * 60 * 1000) {
            setStatus('You can only request 1 SOL per day. Please try again later.');
            return;
        }

        try {
            setStatus('Airdrop in progress...');
            const airdropSignature = await connection.requestAirdrop(
                publicKey,
                LAMPORTS_PER_SOL
            );
            await connection.confirmTransaction(airdropSignature);
            
            updateBalance(publicKey);
            setLastAirdropTime(currentTime);
            setStatus('Airdrop successful! 1 SOL has been added to your wallet.');
        } catch (error) {
            console.error('Airdrop failed:', error);
            setStatus('Airdrop failed. Please try again.');
        }
    }

    return (
        <div className="airdrop-container">
            <h2>Request SOL</h2>
            {publicKey ? (
                <>
                    <p>Connected Address: {publicKey.toBase58()}</p>
                    <p>Balance: {balance.toFixed(2)} SOL</p>
                    <button onClick={handleAirdrop}>Request 1 SOL</button>
                </>
            ) : (
                <p>Please connect your wallet to request SOL.</p>
            )}
            {status && <p className="status-message">{status}</p>}
        </div>
    );
}