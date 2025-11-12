# SolanaForm

SolanaForm is a decentralized application on the Solana blockchain that enables users to create incentivized forms and surveys. Participants are rewarded with SOL prizes, which are distributed randomly and transparently after a form's expiration.

## Overview

This project provides a full-stack solution for creating and participating in on-chain surveys. It leverages the Anchor framework for rapid development of the Solana smart contract (Program) and a modern React frontend using Vite for a seamless user experience. The core goal is to demonstrate a practical use case for Solana's high throughput and low transaction costs, enabling micro-transactions for participant rewards.

## Features

-   **On-Chain Form Creation:** Creators can define a form with a title, prize pool, duration, and maximum number of participants.
-   **Decentralized Submissions:** Users can submit responses to active forms, with their participation recorded on-chain.
-   **Privacy-Preserving Verification:** Submissions are linked to a hashed email to prevent spam while maintaining user privacy.
-   **Automated Prize Distribution:** A two-step prize distribution mechanism ensures fair and transparent winner selection.
    1.  A form creator calls a `distribute` instruction, which closes the form and generates a secure random seed on-chain.
    2.  Winners are deterministically calculated client-side based on the on-chain seed.
-   **Winner-Claimable Prizes:** Selected winners can claim their portion of the prize pool directly from their dashboard.
-   **Dynamic UI:** A responsive frontend that allows users to create, view, fill, and manage forms.

## Tech Stack

**On-Chain (Backend)**
-   **Solana:** The underlying blockchain platform.
-   **Rust:** The language used for the smart contract.
-   **Anchor:** A framework for Solana Sealevel runtime development, simplifying program creation.

**Off-Chain (Frontend)**
-   **React:** A JavaScript library for building user interfaces.
-   **TypeScript:** For static typing and improved developer experience.
-   **Vite:** A modern, fast build tool for frontend development.
-   **Solana Wallet Adapter:** A suite of React components for connecting to Solana wallets.
-   **Tailwind CSS:** For utility-first styling.

## Project Structure

```
/
├── app/                # React/Vite frontend application
├── programs/           # Anchor program (smart contract)
│   └── solanaform/
│       └── src/lib.rs  # Core on-chain logic
├── tests/              # Integration tests for the Anchor program
├── migrations/         # Deployment scripts
├── target/             # Build artifacts, including the IDL
└── Anchor.toml         # Anchor project configuration
```

## Prerequisites

Before you begin, ensure you have the following installed:
-   [Rust](https://www.rust-lang.org/tools/install)
-   [Solana Tool Suite](https://docs.solana.com/cli/install-solana-cli-tools)
-   [Anchor Framework (avm)](https://www.anchor-lang.com/docs/installation)
-   [Node.js](https://nodejs.org/en/) (v18 or higher)
-   [Yarn](https://yarnpkg.com/getting-started/install)

## Local Development Setup

Follow these steps to get the project running on your local machine.

**1. Clone the Repository**
```sh
git clone <repository-url>
cd solanaform
```

**2. Install Dependencies**
Install both the frontend and root-level Node.js dependencies.
```sh
yarn
cd app && yarn
cd ..
```

**3. Build the Anchor Program**
This command compiles the Rust program and generates the IDL (Interface Definition Language) file, which is crucial for the frontend to communicate with the program.
```sh
anchor build
```
After a successful build, the IDL JSON file will be located at `target/idl/solana_form.json`.

**4. Copy the IDL to the Frontend**
The frontend needs the IDL to create a typed client for the program.
```sh
cp target/idl/solana_form.json app/src/idl/
```

**5. Start the Local Solana Validator**
Run a local Solana cluster in a separate terminal window. This command will create a `test-ledger` directory for storing chain state.
```sh
solana-test-validator
```

**6. Deploy the Program**
Deploy the compiled program to your local validator.
```sh
anchor deploy
```

**7. Run the Frontend Application**
Start the Vite development server.
```sh
cd app
npm run dev
```
The application will be available at `http://localhost:5173`. You will need a Solana wallet (like Phantom) set to "Localnet (localhost:8899)" to interact with the dApp.

## Key Anchor Commands

-   **Build the program:**
    ```sh
    anchor build
    ```
-   **Run tests:**
    ```sh
    anchor test
    ```
-   **Deploy the program:**
    ```sh
    anchor deploy
    ```
-   **Upgrade a deployed program:**
    ```sh
    anchor upgrade --program-id <PROGRAM_ID>
    ```

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.