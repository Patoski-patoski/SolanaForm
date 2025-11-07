# SolanaForm MVP - Complete Setup Guide

## 📋 Project Overview

**SolanaForm** is a decentralized incentivized form platform built on Solana that pays users to complete surveys and questionnaires.

**Key Features:**
- ✅ Form creation with SOL prize pools
- ✅ Wallet-based participant registration
- ✅ Time-limited form submissions
- ✅ Random prize distribution to participants
- ✅ Email verification (hashed for privacy)
- ✅ Dashboard for creators and participants

---

## 🚀 5-Day Development Timeline

### Day 1-2: Smart Contract Development ⚡
- [x] Anchor program structure created
- [ ] Deploy to Devnet
- [ ] Test all instructions
- [ ] Handle edge cases

### Day 3: Frontend Development 🎨
- [x] React app with wallet integration
- [ ] Connect to deployed program
- [ ] Test user flows
- [ ] Add error handling

### Day 4: Integration & Testing 🧪
- [ ] End-to-end testing
- [ ] Fix bugs
- [ ] Optimize UX
- [ ] Add loading states

### Day 5: Polish & Demo 🎬
- [ ] Documentation
- [ ] Demo video
- [ ] Deploy frontend
- [ ] Prepare presentation

---

## 🛠️ Installation & Setup

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Install Node.js dependencies
npm install -g yarn
```

### Project Structure

```
solana-form/
├── programs/
│   └── solana-form/
│       ├── src/
│       │   └── lib.rs          # Smart contract code
│       └── Cargo.toml
├── app/
│   ├── src/
│   │   ├── App.jsx             # React frontend
│   │   ├── idl/
│   │   │   └── solana_form.json # Generated IDL
│   │   └── utils/
│   │       └── program.js      # Program interaction helpers
│   ├── package.json
│   └── public/
├── tests/
│   └── solana-form.ts          # Anchor tests
├── Anchor.toml
└── package.json
```

---

## 📦 Step 1: Initialize Anchor Project

```bash
# Create new Anchor project
anchor init solana-form
cd solana-form

# Copy the smart contract code into programs/solana-form/src/lib.rs
# (Use the Rust code from the first artifact)
```

---

## 🔧 Step 2: Configure Anchor.toml

```toml
[features]
seeds = false
skip-lint = false

[programs.devnet]
solana_form = "YourProgramIDHere111111111111111111111111111"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "Devnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

---

## 🏗️ Step 3: Build & Deploy Smart Contract

```bash
# Generate a new keypair for your program
solana-keygen new -o target/deploy/solana_form-keypair.json

# Get the program ID
solana address -k target/deploy/solana_form-keypair.json

# Update lib.rs with your program ID (line 4)
# declare_id!("YourActualProgramIDHere");

# Build the program
anchor build

# Deploy to devnet
anchor deploy

# Verify deployment
solana program show <YOUR_PROGRAM_ID> --url devnet
```

---

## ⚙️ Step 4: Setup Frontend

```bash
# Navigate to app directory
cd app

# Install dependencies
npm install @solana/web3.js @solana/wallet-adapter-react \
  @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets \
  @solana/wallet-adapter-base @project-serum/anchor \
  lucide-react

# Copy the React code into src/App.jsx
# Copy the generated IDL from target/idl/solana_form.json to src/idl.json

# Update App.jsx with your actual program ID
```

### Frontend package.json

```json
{
  "name": "solana-form-app",
  "version": "1.0.0",
  "dependencies": {
    "@solana/web3.js": "^1.87.6",
    "@solana/wallet-adapter-base": "^0.9.23",
    "@solana/wallet-adapter-react": "^0.15.35",
    "@solana/wallet-adapter-react-ui": "^0.9.35",
    "@solana/wallet-adapter-wallets": "^0.19.32",
    "@project-serum/anchor": "^0.29.0",
    "lucide-react": "^0.263.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 🧪 Step 5: Write Tests

Create `tests/solana-form.ts`:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaForm } from "../target/types/solana_form";
import { expect } from "chai";

describe("solana-form", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaForm as Program<SolanaForm>;
  const formId = "test-form-" + Date.now();

  it("Initializes a form", async () => {
    const [formPda] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("form"), Buffer.from(formId)],
      program.programId
    );

    const prizePool = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);
    const deadline = new anchor.BN(Date.now() / 1000 + 86400); // 24 hours
    const maxParticipants = 100;

    await program.methods
      .initializeForm(formId, prizePool, deadline, maxParticipants)
      .accounts({
        form: formPda,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const formAccount = await program.account.form.fetch(formPda);
    expect(formAccount.prizePool.toString()).to.equal(prizePool.toString());
  });

  it("Deposits prize pool", async () => {
    const [formPda] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("form"), Buffer.from(formId)],
      program.programId
    );

    await program.methods
      .depositPrize()
      .accounts({
        form: formPda,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const formAccount = await program.account.form.fetch(formPda);
    expect(formAccount.collectedAmount.gt(new anchor.BN(0))).to.be.true;
  });

  it("Submits a form", async () => {
    const [formPda] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("form"), Buffer.from(formId)],
      program.programId
    );

    const user = anchor.web3.Keypair.generate();
    
    // Airdrop SOL to user for transaction fees
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        user.publicKey,
        1 * anchor.web3.LAMPORTS_PER_SOL
      )
    );

    const [participantPda] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("participant"), formPda.toBuffer(), user.publicKey.toBuffer()],
      program.programId
    );

    const emailHash = "sha256_hash_of_email";

    await program.methods
      .submitForm(emailHash)
      .accounts({
        form: formPda,
        participant: participantPda,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    const participantAccount = await program.account.participant.fetch(participantPda);
    expect(participantAccount.wallet.toString()).to.equal(user.publicKey.toString());
  });
});
```

Run tests:
```bash
anchor test
```

---

## 🎯 Step 6: Create Helper Utilities

Create `app/src/utils/program.js`:

```javascript
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@project-serum/anchor';
import idl from '../idl/solana_form.json';

const PROGRAM_ID = new PublicKey('YourProgramIDHere111111111111111111111111111');

export function getProgram(connection, wallet) {
  const provider = new AnchorProvider(connection, wallet, {});
  return new Program(idl, PROGRAM_ID, provider);
}

export async function getFormPDA(formId) {
  const [pda] = await PublicKey.findProgramAddressSync(
    [Buffer.from('form'), Buffer.from(formId)],
    PROGRAM_ID
  );
  return pda;
}

export async function getParticipantPDA(formPDA, userPublicKey) {
  const [pda] = await PublicKey.findProgramAddressSync(
    [Buffer.from('participant'), formPDA.toBuffer(), userPublicKey.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}
```

---

## 🌐 Step 7: Run the Frontend

```bash
cd app
npm run dev

# Open http://localhost:5173
```

---

## 📝 Testing Checklist

### Smart Contract Tests
- [ ] Initialize form with valid parameters
- [ ] Deposit prize pool
- [ ] Submit form as participant
- [ ] Distribute prizes after deadline
- [ ] Claim prize as winner
- [ ] Handle errors (deadline passed, max participants, etc.)

### Frontend Tests
- [ ] Connect Phantom wallet
- [ ] Create new form
- [ ] View active forms
- [ ] Fill and submit form
- [ ] View dashboard
- [ ] Check winner status

---

## 🚨 Common Issues & Solutions

### Issue: "Program not deployed"
```bash
# Solution: Redeploy program
anchor deploy --provider.cluster devnet
```

### Issue: "Insufficient funds"
```bash
# Solution: Airdrop SOL to your wallet
solana airdrop 2 <YOUR_WALLET_ADDRESS> --url devnet
```

### Issue: "Transaction simulation failed"
```bash
# Solution: Check program logs
solana logs --url devnet
```

### Issue: Wallet connection fails
```bash
# Solution: Install Phantom wallet extension
# Visit: https://phantom.app/
```

---

## 🎬 Demo Preparation

### What to Show:
1. **Creator Flow:**
   - Create form with 0.5 SOL prize
   - Set deadline and max participants
   - Show transaction confirmation

2. **Participant Flow:**
   - Connect wallet
   - Browse active forms
   - Fill form and submit
   - Check participation status

3. **Distribution:**
   - After deadline expires
   - Distribute prizes
   - Winners claim rewards

### Demo Script:
```
1. "This is SolanaForm - get paid to share your opinion"
2. Show homepage with active forms
3. Create new form (walk through process)
4. Switch to different wallet
5. Fill the form as participant
6. Show dashboard with stats
7. Explain prize distribution mechanism
```

---

## 🎓 Bootcamp Deliverables

### Required:
- ✅ Working Anchor program deployed to Devnet
- ✅ Frontend with wallet integration
- ✅ Test suite with passing tests
- ✅ README documentation
- ✅ Demo video (3-5 minutes)

### Bonus Points:
- 🌟 Email verification system
- 🌟 Anti-spam measures
- 🌟 Multiple form templates
- 🌟 Analytics dashboard
- 🌟 Mobile responsive design

---

## 📚 Resources

- [Anchor Book](https://book.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

---

## 🤝 Next Steps

1. **Today**: Deploy smart contract, test locally
2. **Day 3**: Integrate frontend with program
3. **Day 4**: End-to-end testing, bug fixes
4. **Day 5**: Documentation, demo video, final polish

---

## 💡 MVP vs Future Features

### MVP (Build Now):
- Basic form creation
- Wallet connection
- Simple prize distribution
- Email collection

### Future (After Bootcamp):
- Advanced randomization (Chainlink VRF)
- SPL token support
- Complex form logic (conditional questions)
- Analytics dashboard
- Email verification service
- Reputation system
- Form templates library

---

