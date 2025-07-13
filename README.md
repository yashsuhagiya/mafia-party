# Mafia Party 🎭

A thrilling digital Mafia game perfect for virtual game nights and gatherings! Create exciting Mafia games with friends and family.

## Features

- 🎮 Interactive game creation and management
- 👥 Role assignment system with classic Mafia roles
- 📱 Mobile-responsive design
- 🎨 Beautiful, modern UI with smooth animations
- 🔄 Real-time game state management with Redux

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Icons**: FontAwesome
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yashsuhagiya/mafia-party.git
cd mafia-party
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Run the development server:
```bash
pnpm dev
# or
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Game Rules

### Roles Available:
- **Mafia**: Eliminate villagers during night phases
- **Villagers**: Vote to eliminate suspected mafia during day phases
- **Detective**: Investigate players to discover their roles
- **Doctor**: Protect players from elimination
- **Mayor**: Has double voting power

## How to Play

1. **Setup**: Create a game and assign roles to players
2. **Night Phase**: Mafia chooses targets, Doctor protects, Detective investigates
3. **Day Phase**: All players discuss and vote to eliminate suspects
4. **Win Conditions**: 
   - Villagers win by eliminating all Mafia
   - Mafia wins by equaling or outnumbering Villagers

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically with each push to main

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Made with ❤️ for game night enthusiasts!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
