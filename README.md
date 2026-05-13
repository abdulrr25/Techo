<div align="center">

<img src="https://img.shields.io/badge/Base_Sepolia-0052FF?style=for-the-badge&logo=coinbase&logoColor=white" />
<img src="https://img.shields.io/badge/Superfluid-1DC700?style=for-the-badge&logo=ethereum&logoColor=white" />
<img src="https://img.shields.io/badge/Huddle01-8B5CF6?style=for-the-badge&logo=webrtc&logoColor=white" />
<img src="https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/ERC--1155-F7931A?style=for-the-badge&logo=ethereum&logoColor=white" />

<br /><br />

# **Techo** — Learn Anything. Pay Per Second.

**The first decentralized education platform where ETHx streams directly  
from student to teacher in real-time — pay only for the exact seconds you learn.**

<br />

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-0075ff?style=for-the-badge)](https://youtu.be/88_QtgqihZU)
[![Contract](https://img.shields.io/badge/📜_Smart_Contract-Base_Sepolia-0052FF?style=for-the-badge)](https://sepolia.basescan.org/address/0xF8E9F063228eb47137101eb863BF3976466AA31F)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## ✨ What is Techo?

Techo reimagines online education with a trustless, pay-as-you-go model. Traditional platforms charge upfront — students pay even if a class is terrible. Techo fixes that:

> Students pay **10% upfront** as a commitment deposit. The remaining **90% streams per second** via Superfluid directly to the teacher's wallet. Leave any time — the stream stops instantly, and you're only charged for time actually spent learning.

No platform cut. No intermediaries. Fully on-chain.

---

## 🎯 Key Features

| Feature | Description |
|---|---|
| ⏱ **Pay Per Second** | Powered by Superfluid CFA — ETHx flows in real-time from student to teacher |
| 🔒 **Smart Contract Escrow** | All class logic is governed by auditable contracts on Base Sepolia |
| 🎖 **NFT Attendance Proof** | ERC-1155 NFT minted on enrollment — verifiable on-chain certificate |
| 🎥 **Live HD Video** | Huddle01 WebRTC SDK — crystal-clear video, audio, and screen sharing |
| 0️⃣ **Zero Platform Fee** | 100% of payments go directly from student to teacher |
| 🦊 **MetaMask Native** | Connect with MetaMask, one click — no custodians, no KYC |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Techo PLATFORM                         │
├────────────────────┬────────────────────┬───────────────────────┤
│   FRONTEND         │   SMART CONTRACT   │   MEDIA LAYER         │
│   Next.js 14       │   Base Sepolia     │   Huddle01            │
│   Chakra UI        │                   │                       │
│   Framer Motion    │  ┌─────────────┐  │  ┌─────────────────┐  │
│   wagmi v2         │  │ TechoGig   │  │  │  Room Creation  │  │
│                    │  │  createGig  │  │  │  AccessToken    │  │
│  ┌──────────────┐  │  │  buyGig     │  │  │  WebRTC Peers   │  │
│  │  useWeb3.js  │  │  │  myClasses  │  │  └─────────────────┘  │
│  │  useStream.js│  │  └──────┬──────┘  │                       │
│  └──────────────┘  │         │         │  PAYMENTS             │
│                    │         ▼         │  Superfluid           │
│                    │  ┌─────────────┐  │                       │
│                    │  │  ERC-1155   │  │  ┌─────────────────┐  │
│                    │  │   NFT Mint  │  │  │ CFAv1Forwarder  │  │
│                    │  └─────────────┘  │  │  createFlow     │  │
│                    │                   │  │  deleteFlow     │  │
│                    │                   │  │  ETHx Token     │  │
│                    │                   │  └─────────────────┘  │
└────────────────────┴────────────────────┴───────────────────────┘
```

---

## 🔄 How It Works

### For Teachers (Hosts)
```
1.  Connect MetaMask → Base Sepolia network
2.  Fill class details: title, description, schedule, price/hour
3.  Huddle01 meeting room created via API
4.  Smart contract registers the gig on-chain
5.  When class goes live → students join → ETHx streams to your wallet per second
```

### For Students (Learners)
```
1.  Connect MetaMask → Browse available classes
2.  Click "Enroll" → Pay 10% deposit upfront (trust commitment)
3.  ERC-1155 NFT minted to your wallet as enrollment proof
4.  Join the live session at scheduled time
5.  Superfluid stream opens automatically on room join
6.  Leave anytime → stream stops → charged only for time attended
```

### Payment Flow
```
Student Wallet ──[10% upfront]──────────────────────► Contract
Student Wallet ──[90% per second via Superfluid]────► Teacher Wallet
                                                          ▲
                        ETHx (wrapped ETH) ───────────────┘
                        Rate: flowRate wei/second
                        Stop: deleteFlow() on leave
```

---

## 🛠 Tech Stack

### Frontend
| Package | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org) | 14.1.0 | React framework (Pages Router) |
| [Chakra UI](https://chakra-ui.com) | 2.8.x | UI component library |
| [Framer Motion](https://framer.com/motion) | 12.x | Animations |
| [Tailwind CSS](https://tailwindcss.com) | 3.4.x | Utility CSS |
| [Lucide React](https://lucide.dev) | 1.x | Icons |

### Web3 & Wallet
| Package | Version | Purpose |
|---|---|---|
| [wagmi](https://wagmi.sh) | 2.5.x | Ethereum React hooks |
| [viem](https://viem.sh) | 2.x | Ethereum utilities |
| [ethers.js](https://ethers.org) | 6.x | Contract interaction |

### Media & Payments
| Package | Version | Purpose |
|---|---|---|
| [@huddle01/react](https://huddle01.com) | 2.6.4 | WebRTC video/audio SDK |
| [@huddle01/server-sdk](https://huddle01.com) | 2.6.2 | Room & token management |
| [Superfluid CFAv1Forwarder](https://superfluid.finance) | — | Real-time payment streams |

### Blockchain
| Item | Value |
|---|---|
| Network | **Base Sepolia** (testnet) |
| Chain ID | `84532` |
| Contract | [`0xF8E9F063228eb47137101eb863BF3976466AA31F`](https://sepolia.basescan.org/address/0xF8E9F063228eb47137101eb863BF3976466AA31F) |
| Superfluid Forwarder | `0xcfA132E353cB4E398080B9700609bb008eceB125` |
| ETHx Super Token | `0x143ea239159155B408e71CDbE836e8CFD6766732` |
| NFT Standard | ERC-1155 |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MetaMask** browser extension
- Base Sepolia ETH ([get free testnet ETH](https://faucet.quicknode.com/base/sepolia))
- Huddle01 API Key ([get free at huddle01.com/dashboard](https://huddle01.com/dashboard))

### 1. Clone & Install

```bash
git clone https://github.com/abdulrr25/techo.git
cd techo
npm install --legacy-peer-deps
```

### 2. Environment Variables

Create a `.env.local` file in the project root:

```env
# ── Huddle01 ──────────────────────────────────────────────────────────────────
HUDDLE_API_KEY=                    # Server-only: your Huddle01 API key
NEXT_PUBLIC_HUDDLE_API_KEY=        # Client: same key (for room joining)
NEXT_PUBLIC_PROJECT_ID=            # Huddle01 project ID

# ── Network ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_NETWORK_NAME=base-sepolia
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org

# ── Smart Contracts ───────────────────────────────────────────────────────────
NEXT_PUBLIC_CONTRACT_ADDRESS=0xF8E9F063228eb47137101eb863BF3976466AA31F
NEXT_PUBLIC_FORWARDER_ADDRESS=0xcfA132E353cB4E398080B9700609bb008eceB125
NEXT_PUBLIC_SUPER_TOKEN_ADDRESS=0x143ea239159155B408e71CDbE836e8CFD6766732
```

> **How to get Huddle01 keys:** Sign up at [dashboard.huddle01.com](https://dashboard.huddle01.com) → Create a project → Copy `API Key` and `Project ID`.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Configure MetaMask

Add Base Sepolia to MetaMask:

| Setting | Value |
|---|---|
| Network Name | Base Sepolia Testnet |
| RPC URL | `https://sepolia.base.org` |
| Chain ID | `84532` |
| Currency Symbol | `ETH` |
| Block Explorer | `https://sepolia.basescan.org` |

---

## 💸 Using ETHx (Super Token)

Superfluid payments require **ETHx** (wrapped ETH). Wrap ETH → ETHx directly in the app:

1. Join a class session
2. If your ETHx balance is zero, the **"Wrap ETH → ETHx"** modal appears automatically
3. Enter amount → confirm MetaMask → you're ready to stream

Or wrap manually at [app.superfluid.finance](https://app.superfluid.finance) on Base Sepolia.

---

## 📁 Project Structure

```
Techo/
├── pages/
│   ├── index.js              # Landing page
│   ├── gigs.js               # Browse all live classes
│   ├── host-class.js         # Create a new class
│   ├── my-classes.js         # Your hosted & enrolled classes
│   ├── [room]/index.js       # Live video room (Huddle01 + Superfluid)
│   └── api/
│       ├── create-room.js    # POST: creates Huddle01 room
│       ├── getAccessToken.js # GET: generates JWT for room access
│       └── getRoomStatus.js  # GET: checks room status
├── hooks/
│   ├── useWeb3.js            # wagmi wallet hook
│   └── useStream.js          # Superfluid stream lifecycle
├── constants/
│   ├── abi.js                # Techo contract ABI
│   └── superfluidAbi.js      # CFAv1Forwarder + ETHx ABIs
├── components/
│   └── Navbar.jsx            # Navigation bar
└── styles/
    └── globals.css           # Morphic design system
```

---

## 🔐 Smart Contract Functions

| Function | Description |
|---|---|
| `createGig(title, desc, time, meetingId, flowRate, price)` | Host creates a new class |
| `buyGig(gigId)` | Student enrolls — pays 10%, mints ERC-1155 NFT |
| `myClasses(address)` | Returns all classes for a given address |

---

## 🌊 Superfluid Integration

Techo uses the **CFAv1Forwarder** contract at `0xcfA132E353cB4E398080B9700609bb008eceB125` (same address on all networks).

```javascript
// Start streaming when student joins
await forwarder.createFlow(
  ETHx_ADDRESS,         // super token
  studentAddress,       // sender
  teacherAddress,       // receiver
  flowRateWeiPerSecond, // e.g. parseEther("0.01") / 3600n
  "0x"                  // no userData
)

// Stop streaming when student leaves
await forwarder.deleteFlow(ETHx_ADDRESS, studentAddress, teacherAddress, "0x")
```

The flow rate is derived from the price set when the gig is created:

```javascript
const flowRatePerSec = parseEther(pricePerHour) / 3600n
```

---

## 📹 Huddle01 Integration

Room creation happens server-side (API key never exposed to client):

```javascript
// POST /api/create-room
const result = await new API({ apiKey }).createRoom({
  metadata: JSON.stringify({ title, description })
})
// Returns: { roomId: "abc-xyz-123" }
```

JWT access tokens are generated per-join:

```javascript
// GET /api/getAccessToken?roomId=abc-xyz-123
const token = await new AccessToken({
  apiKey, roomId, role: Role.HOST,
  permissions: { canProduce: true, canConsume: true, ... }
}).toJwt()
```

---

## 🎨 Design System

Techo uses a **Morphic-inspired** dark design system:

| Token | Value |
|---|---|
| Background | `#000000` |
| Card surface | `#0a0a0a` |
| Elevated card | `#111113` |
| Accent blue | `#0075ff` |
| Muted text | `#71717a` |
| Border | `rgba(255,255,255,0.08)` |
| Font | Inter + JetBrains Mono |
| Border radius | `9999px` (pill buttons), `16px` (cards) |

---

## 🔧 Scripts

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm run format       # Prettier format
npm run type-check   # TypeScript check
```

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Set all environment variables in **Vercel Dashboard → Settings → Environment Variables**.

> **Important:** `HUDDLE_API_KEY` must be set as a server-side only variable (no `NEXT_PUBLIC_` prefix). All `NEXT_PUBLIC_*` vars are exposed to the browser.

### Self-hosted

```bash
npm run build
npm run start
```

---

## 🤝 Contributing

```bash
git clone https://github.com/abdulrr25/techo.git
cd techo
git checkout -b feature/your-feature
npm install --legacy-peer-deps
git commit -m "feat: your feature"
git push origin feature/your-feature
# Open a Pull Request on GitHub
```

---

## 🚀 Roadmap

- [ ] Multi-chain deployment (Base Mainnet, Polygon)
- [ ] Lecturer reputation & review system
- [ ] On-chain course completion certificates
- [ ] DAO-based educator governance
- [ ] AI-powered class recommendations
- [ ] Mobile app (React Native)

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built on Base Sepolia**

[Browse Classes](https://github.com/abdulrr25/techo) · [Host a Class](https://github.com/abdulrr25/techo) · [Smart Contract](https://sepolia.basescan.org/address/0xF8E9F063228eb47137101eb863BF3976466AA31F)

<sub>Techo is a testnet project. All transactions use Base Sepolia testnet ETH — no real monetary value.</sub>

</div>
