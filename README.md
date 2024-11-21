# Social Media dApp

This project implements a decentralized social media application using Clarity smart contracts and the Clarinet development framework. The application includes the following components:

1. Decentralized Content Storage
2. Token-based Content Monetization
3. Censorship-Resistant Posting

## Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet)
- [Node.js](https://nodejs.org/)

## Setup

1. Clone the repository:

git clone [https://github.com/yourusername/social-media-dapp.git](https://github.com/yourusername/social-media-dapp.git)
cd social-media-dapp

```plaintext

2. Install dependencies:
```

npm install

```plaintext

3. Run tests:
```

clarinet test

```plaintext

## Contracts

### Content Storage

The `content-storage` contract manages the creation, updating, and deletion of posts:
- Create new posts with content and IPFS hash
- Update existing posts
- Delete posts
- Retrieve post information

### Content Monetization

The `content-monetization` contract handles token-based monetization:
- Mint social tokens
- Tip posts with tokens
- Track post tips and token balances

### Censorship-Resistant Posting

The `censorship-resistant-posting` contract ensures content remains accessible:
- Flag posts for moderation
- Resolve flagged posts
- Manage user reputation based on moderation decisions

## Testing

Each contract has its own test file in the `tests` directory. You can run all tests using the `clarinet test` command.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
```
