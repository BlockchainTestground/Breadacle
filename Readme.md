[![Netlify Status](https://api.netlify.com/api/v1/badges/87b89273-7f16-48a0-bf98-7f86196d7ff6/deploy-status)](https://app.netlify.com/sites/silly-blackwell-cb5b80/deploys)

# Dependencies

```bash
npm install
```

# Compile

```bash
truffle compile
```

# Deploy

Create a new migration on the `./migrations/` directory following the same sequence. Create a `.secret` file and paste your mnemonic. An then:

```bash
truffle migrate --network mumbai
truffle migrate --network matic
```

# Current Deployment

Currently deployed at `0xAdf3268D08aFBD5be282993fB89D4100Ad315a02`. ABI is located at `current_deployment/TestgroundGame.json`.

# Related contracts and documentation

This project uses a [ERC20 Token](https://github.com/BlockchainTestground/MaticERC20) deployed at `0xd6d897b8FBF9b82c493dc256A2924bE41efda34f` in the mumbai network.

This also uses the [Link Token Contract](https://docs.chain.link/docs/link-token-contracts/) and [Link VRF Contract](https://docs.chain.link/docs/vrf-contracts/).

* Matic:
  * Link Token: `0xb0897686c545045aFc77CF20eC7A532E3120E0F1`
  * VRF Coordinator: `0x3d2341ADb2D31f1c5530cDC622016af293177AE0`
  * Key Hash: `0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da`
  * Fee: `0.0001 LINK`
* Mumbai: 
  * Link Token: `0x326C977E6efc84E512bB9C30f76E30c160eD06FB`
  * VRF Coordinator: `0x8C7382F9D8f56b33781fE506E897a4F1e2d17255`
  * Key Hash: `0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4`
  * Fee: `0.0001 LINK`
