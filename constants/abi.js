const TEACHO_ABI = [
  {
    inputs: [
      { internalType: "string", name: "_title", type: "string" },
      { internalType: "string", name: "_description", type: "string" },
      { internalType: "string", name: "_time", type: "string" },
      { internalType: "string", name: "_meetingId", type: "string" },
      { internalType: "uint256", name: "_flowRate", type: "uint256" },
      { internalType: "uint256", name: "stringFlowRate", type: "uint256" },
    ],
    name: "createGig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "listGigs",
    outputs: [
      {
        components: [
          { internalType: "address", name: "host", type: "address" },
          { internalType: "string", name: "title", type: "string" },
          { internalType: "string", name: "description", type: "string" },
          { internalType: "string", name: "time", type: "string" },
          { internalType: "string", name: "meetingId", type: "string" },
          { internalType: "uint256", name: "flowRate", type: "uint256" },
          { internalType: "uint256", name: "stringFlowRate", type: "uint256" },
          { internalType: "uint256", name: "gigId", type: "uint256" },
          { internalType: "uint256", name: "nftTokenId", type: "uint256" },
          { internalType: "uint256", name: "attendees", type: "uint256" },
        ],
        internalType: "struct Teacho.Gig[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_gigId", type: "uint256" }],
    name: "buy",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "myClasses",
    outputs: [
      {
        components: [
          { internalType: "address", name: "host", type: "address" },
          { internalType: "string", name: "title", type: "string" },
          { internalType: "string", name: "description", type: "string" },
          { internalType: "string", name: "time", type: "string" },
          { internalType: "string", name: "meetingId", type: "string" },
          { internalType: "uint256", name: "flowRate", type: "uint256" },
          { internalType: "uint256", name: "stringFlowRate", type: "uint256" },
          { internalType: "uint256", name: "gigId", type: "uint256" },
          { internalType: "uint256", name: "nftTokenId", type: "uint256" },
          { internalType: "uint256", name: "attendees", type: "uint256" },
        ],
        internalType: "struct Teacho.Gig[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "gigId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxAttendees",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

export default TEACHO_ABI;
