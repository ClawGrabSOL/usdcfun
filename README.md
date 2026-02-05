# 💵 USDC.fun - Token Launchpad

A professional token launchpad built with Next.js and Solana wallet integration. Launch your meme coins on pump.fun using **USDC** instead of SOL.

## ✨ Features

- 🔌 **Phantom Wallet** - Connect with one click
- 💵 **Pay with USDC** - Launch and buy tokens using USDC
- 🎨 **Blue/White Theme** - Clean professional design
- 📝 **Token Launch** - Create tokens with name, symbol, description, image
- 🔗 **Social Links** - Add Twitter, Telegram, Website
- 💰 **Initial Buy** - Buy tokens immediately on creation with USDC
- 📊 **Tokens Page** - Browse all launched tokens with filters & search
- 📱 **Responsive** - Works on desktop and mobile

## 🚀 Quick Start

```bash
cd usdc.fun
npm install
npm run dev
```

Open **http://localhost:3000**

## 📁 Structure

```
src/
├── app/
│   ├── page.tsx         # Home - Launch form
│   ├── tokens/page.tsx  # All tokens listing
│   ├── profile/page.tsx # User profile & holdings
│   ├── fees/page.tsx    # Fee structure docs
│   ├── providers.tsx    # Solana wallet providers
│   ├── layout.tsx       # Root layout
│   └── globals.css      # Blue/white theme
└── components/
    ├── Header.tsx       # Nav with USDC.fun logo
    ├── LaunchForm.tsx   # Token creation form (USDC)
    └── WalletButton.tsx # Phantom connect button
```

## 🎨 Theme

- **Primary**: USDC Blue (#2775ca)
- **Background**: White (#ffffff)  
- **Cards**: Gray-50 with borders
- **Accents**: Blue glow effects

## 💵 USDC Integration

USDC Mint Address (Solana Mainnet):
```
EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

## 🔧 Configuration

### Custom RPC (Optional)

Create `.env.local`:
```env
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

## 📜 License

MIT
