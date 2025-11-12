// app/src/idl/solana_form.ts
// Generated type definitions for the Solana Form program

export type SolanaForm = {
  version: "0.1.0";
  name: "solana_form";
  instructions: [
    {
      name: "initializeForm";
      accounts: [
        { name: "form"; isMut: true; isSigner: false },
        { name: "authority"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [
        { name: "formId"; type: "string" },
        { name: "prizePool"; type: "u64" },
        { name: "deadline"; type: "i64" },
        { name: "maxParticipants"; type: "u32" }
      ];
    },
    {
      name: "depositPrize";
      accounts: [
        { name: "form"; isMut: true; isSigner: false },
        { name: "authority"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [];
    },
    {
      name: "submitForm";
      accounts: [
        { name: "form"; isMut: true; isSigner: false },
        { name: "participant"; isMut: true; isSigner: false },
        { name: "user"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [{ name: "emailHash"; type: { array: ["u8", 32] } }];
    },
    {
      name: "distributePrizes";
      accounts: [
        { name: "form"; isMut: true; isSigner: false },
        { name: "authority"; isMut: true; isSigner: true }
      ];
      args: [];
    },
    {
      name: "checkAndClaimPrize";
      accounts: [
        { name: "form"; isMut: true; isSigner: false },
        { name: "participant"; isMut: true; isSigner: false },
        { name: "winner"; isMut: true; isSigner: false },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [];
    },
    {
      name: "closeForm";
      accounts: [
        { name: "form"; isMut: true; isSigner: false },
        { name: "authority"; isMut: true; isSigner: true }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "form";
      type: {
        kind: "struct";
        fields: [
          { name: "authority"; type: "publicKey" },
          { name: "formId"; type: "string" },
          { name: "prizePool"; type: "u64" },
          { name: "collectedAmount"; type: "u64" },
          { name: "deadline"; type: "i64" },
          { name: "maxParticipants"; type: "u32" },
          { name: "participantCount"; type: "u32" },
          { name: "isActive"; type: "bool" },
          { name: "isDistributed"; type: "bool" },
          { name: "bump"; type: "u8" },
          { name: "randomSeed"; type: "u64" }
        ];
      };
    },
    {
      name: "participant";
      type: {
        kind: "struct";
        fields: [
          { name: "wallet"; type: "publicKey" },
          { name: "form"; type: "publicKey" },
          { name: "emailHash"; type: { array: ["u8", 32] } },
          { name: "timestamp"; type: "i64" },
          { name: "participantIndex"; type: "u32" },
          { name: "isWinner"; type: "bool" },
          { name: "claimed"; type: "bool" },
          { name: "bump"; type: "u8" }
        ];
      };
    }
  ];
  errors: [
    { code: 6000; name: "FormInactive"; msg: "Form is not active" },
    { code: 6001; name: "AlreadyDistributed"; msg: "Prizes already distributed" },
    { code: 6002; name: "PrizePoolFilled"; msg: "Prize pool already filled" },
    { code: 6003; name: "DeadlinePassed"; msg: "Deadline has passed" },
    { code: 6004; name: "DeadlineNotReached"; msg: "Deadline has not been reached yet" },
    { code: 6005; name: "MaxParticipantsReached"; msg: "Maximum participants reached" },
    { code: 6006; name: "Unauthorized"; msg: "Unauthorized" },
    { code: 6007; name: "NoParticipants"; msg: "No participants to distribute to" },
    { code: 6008; name: "NotDistributed"; msg: "Prizes not distributed yet" },
    { code: 6009; name: "AlreadyClaimed"; msg: "Prize already claimed" },
    { code: 6010; name: "CannotClose"; msg: "Cannot close form with active participants" },
    { code: 6011; name: "NotAWinner"; msg: "Participant is not a winner" }
  ];
};

export const IDL: SolanaForm = {
  version: "0.1.0",
  name: "solana_form",
  instructions: [
    {
      name: "initializeForm",
      accounts: [
        { name: "form", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "formId", type: "string" },
        { name: "prizePool", type: "u64" },
        { name: "deadline", type: "i64" },
        { name: "maxParticipants", type: "u32" }
      ]
    },
    {
      name: "depositPrize",
      accounts: [
        { name: "form", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: []
    },
    {
      name: "submitForm",
      accounts: [
        { name: "form", isMut: true, isSigner: false },
        { name: "participant", isMut: true, isSigner: false },
        { name: "user", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [{ name: "emailHash", type: { array: ["u8", 32] } }]
    },
    {
      name: "distributePrizes",
      accounts: [
        { name: "form", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true }
      ],
      args: []
    },
    {
      name: "checkAndClaimPrize",
      accounts: [
        { name: "form", isMut: true, isSigner: false },
        { name: "participant", isMut: true, isSigner: false },
        { name: "winner", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: []
    },
    {
      name: "closeForm",
      accounts: [
        { name: "form", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true }
      ],
      args: []
    }
  ],
  accounts: [
    {
      name: "form",
      type: {
        kind: "struct",
        fields: [
          { name: "authority", type: "publicKey" },
          { name: "formId", type: "string" },
          { name: "prizePool", type: "u64" },
          { name: "collectedAmount", type: "u64" },
          { name: "deadline", type: "i64" },
          { name: "maxParticipants", type: "u32" },
          { name: "participantCount", type: "u32" },
          { name: "isActive", type: "bool" },
          { name: "isDistributed", type: "bool" },
          { name: "bump", type: "u8" },
          { name: "randomSeed", type: "u64" }
        ]
      }
    },
    {
      name: "participant",
      type: {
        kind: "struct",
        fields: [
          { name: "wallet", type: "publicKey" },
          { name: "form", type: "publicKey" },
          { name: "emailHash", type: { array: ["u8", 32] } },
          { name: "timestamp", type: "i64" },
          { name: "participantIndex", type: "u32" },
          { name: "isWinner", type: "bool" },
          { name: "claimed", type: "bool" },
          { name: "bump", type: "u8" }
        ]
      }
    }
  ],
  errors: [
    { code: 6000, name: "FormInactive", msg: "Form is not active" },
    { code: 6001, name: "AlreadyDistributed", msg: "Prizes already distributed" },
    { code: 6002, name: "PrizePoolFilled", msg: "Prize pool already filled" },
    { code: 6003, name: "DeadlinePassed", msg: "Deadline has passed" },
    { code: 6004, name: "DeadlineNotReached", msg: "Deadline has not been reached yet" },
    { code: 6005, name: "MaxParticipantsReached", msg: "Maximum participants reached" },
    { code: 6006, name: "Unauthorized", msg: "Unauthorized" },
    { code: 6007, name: "NoParticipants", msg: "No participants to distribute to" },
    { code: 6008, name: "NotDistributed", msg: "Prizes not distributed yet" },
    { code: 6009, name: "AlreadyClaimed", msg: "Prize already claimed" },
    { code: 6010, name: "CannotClose", msg: "Cannot close form with active participants" },
    { code: 6011, name: "NotAWinner", msg: "Participant is not a winner" }
  ]
};