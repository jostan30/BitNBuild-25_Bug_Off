# EventChain: Scalable NFT Ticketing

<div align="center">
  
  <!-- Add your logo here -->
  <img width="32" height="32" alt="spectrate-logo" src="https://github.com/user-attachments/assets/5042964f-db49-45bc-9531-46c8d302c90b" />

  ### Revolutionizing Event Ticketing with Hedera Hashgraph
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Hedera](https://img.shields.io/badge/Hedera-Hashgraph-purple)](https://hedera.com)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-green)](https://nodejs.org)

</div>

---

## 📖 Description

The traditional NFT ticketing landscape is plagued by critical issues:

- **Gas Wars**: High-demand events trigger network congestion, causing transaction fees to skyrocket
- **Exorbitant Fees**: Users pay $50-$200+ in gas fees just to mint a $20 ticket
- **Fraud & Scalping**: Counterfeit tickets and bot-driven scalping harm genuine fans
- **Poor User Experience**: Complex wallet interactions deter mainstream adoption

**EventChain** solves these problems by leveraging **Hedera Hashgraph's** enterprise-grade distributed ledger technology. With Hedera's fast consensus (3-5 second finality), predictable low fees ($0.0001 per transaction), and carbon-negative network, EventChain delivers:

✨ **True scalability** without congestion  
✨ **Gasless transactions** where organizers cover minimal fees  
✨ **Fair ticket distribution** through off-chain lottery systems  
✨ **Forgery-proof verification** with on-chain NFT validation  
✨ **Seamless UX** via an intuitive Next.js interface

---

## 🚀 Key Features

### ⚡ Layer-2 Style Scalability via Hedera
- Handle 10,000+ TPS without network congestion
- Sub-second transaction finality using Hedera's hashgraph consensus
- No gas price volatility—fees remain predictable under any load

### 💸 Gasless Transactions
- Event organizers sponsor transaction fees (typically $0.0001/tx)
- Attendees claim tickets without worrying about wallet balances
- Dramatically lowers barrier to entry for non-crypto users

### 🎟️ Fair Ticket Distribution
- **Off-chain whitelisting**: Pre-register for events without paying gas
- **Lottery system**: Random selection ensures bots can't monopolize drops
- **Anti-sybil measures**: Rate limiting and verification prevent abuse

### 🔒 On-Chain NFT Verification
- Tickets minted as Hedera NFTs (HIP-412 standard)
- QR codes link to immutable on-chain metadata
- Event scanners verify authenticity in real-time via Hedera Mirror Nodes

### 🎨 User-Friendly Interface
- Clean, responsive Next.js frontend
- One-click wallet connection (HashPack, Blade, MetaMask)
- Real-time ticket availability updates

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│   Next.js       │  ← User Interface (React, Tailwind CSS)
│   Frontend      │     • Event browsing
└────────┬────────┘     • Wallet integration
         │              • NFT claiming
         │
         ▼
┌─────────────────┐
│   Node.js       │  ← Backend API (Express)
│   Backend       │     • Lottery logic
└────────┬────────┘     • Whitelist management
         │              • Hedera SDK integration
         │
         ▼
┌─────────────────┐
│   Hedera        │  ← Blockchain Layer
│   Hashgraph     │     • NFT minting (HTS)
└─────────────────┘     • Consensus & verification
                        • Smart contracts (optional)
```

### Data Flow
1. **User Registration**: Frontend → Backend (store off-chain)
2. **Lottery Selection**: Backend runs randomized selection
3. **NFT Minting**: Backend calls Hedera SDK → mints NFT
4. **Claim Ticket**: Frontend retrieves NFT metadata from Hedera Mirror Node
5. **Event Entry**: Scanner verifies NFT ownership via Hedera query

---

## 📦 Installation Instructions

### Prerequisites
- Node.js v18+ and npm
- A Hedera testnet/mainnet account ([create one here](https://portal.hedera.com))
- HashPack or Blade wallet for testing

### 1. Clone Repository
```bash
git clone git@github.com:jostan30/BitNBuild-25_Bug_Off.git
cd BitNBuild-25_Bug_Off
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd node-server
npm install

# Install frontend dependencies
cd ../next-app
npm install
```

### 3. Environment Configuration

**Backend (`node-server/.env`)**:
```env
PORT=5000
MONGODB_URI=......
RECAPTCHA_SECRET_KEY=.....
JWT_SECRET=.....

RAZORPAY_KEY_ID=.....
RAZORPAY_KEY_SECRET=......
FRONTEND_URL=http://localhost:3000

NODE_ENV=development

ACCOUNT_ID=.....
PRIVATE_KEY=.....
```

**Frontend (`next-app/.env.local`)**:
```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
RECAPTCHA_SECRET_KEY=....

NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

NEXT_PUBLIC_RAZORPAY_KEY_ID=......
NEXT_PUBLIC_RAZORPAY_KEY_SECRET=.......
```

### 4. Run the Application

**Start Backend**:
```bash
cd node-server
npm run dev
# Server runs on http://localhost:5000
```

**Start Frontend** (in new terminal):
```bash
cd next-app
npm run dev
# App runs on http://localhost:3000
```

---

## 🎯 Usage

### For Event Attendees

#### Step 1: Browse Events
Navigate to the homepage to view upcoming events with available tickets.

#### Step 2: Register for Lottery
```
1. Click "Register" on your desired event
2. Connect your Hedera wallet (HashPack/Blade)
3. Submit registration (no gas fees!)
4. Wait for lottery draw announcement
```

#### Step 3: Claim Your NFT Ticket
```
1. Check if you won via email/dashboard notification
2. Click "Claim Ticket" button
3. NFT is automatically minted to your wallet (gasless)
4. View ticket details in your wallet or dashboard
```

#### Step 4: Event Entry
```
1. Open your EventChain dashboard on event day
2. Display your ticket QR code to the scanner
3. Organizer verifies NFT ownership on Hedera
4. Enjoy the event! 🎉
```
---

## 📸 Demo

<!-- Add screenshots/GIFs here -->

### Homepage
<img width="1842" height="927" alt="Screenshot from 2025-10-02 11-32-04" src="https://github.com/user-attachments/assets/0661adcc-ebb5-420a-a684-98eab5ed977c" />

### Ticket Claim Flow
[Spectrate.webm](https://github.com/user-attachments/assets/b835816f-0273-4f74-9d83-cecbf833d573)

---

## 🤝 Contributing

We welcome contributions! Follow these steps:

### 1. Fork & Clone
```bash
git clone git@github.com:jostan30/BitNBuild-25_Bug_Off.git
cd BitNBuild-25_Bug_Off
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Follow existing code style (ESLint/Prettier configs included)
- Write unit tests for new features
- Update documentation as needed


### 4. Submit Pull Request
```bash
git push origin feature/your-feature-name
# Open PR on GitHub with detailed description
```

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 🗺️ Future Roadmap

### Phase 1 (Q4 2025)
- [ ] Mobile app (React Native)
- [ ] Multi-event season passes
- [ ] Integration with major event platforms (Eventbrite, Ticketmaster)

### Phase 2 (Q1 2026)
- [ ] Secondary marketplace with royalty splits
- [ ] Dynamic NFT tickets (unlock perks based on attendance)
- [ ] DAO governance for platform decisions

### Phase 3 (Q2 2026)
- [ ] AI-driven anti-bot verification system
- [ ] Cross-chain bridging (Ethereum, Polygon)
- [ ] Augmented reality ticket experiences

### Long-term Vision
- [ ] White-label solution for enterprises
- [ ] Integration with metaverse venues
- [ ] Carbon offset tracking for event attendees
