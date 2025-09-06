# WhatsApp Clone

## Project Overview
A full-stack WhatsApp clone built with Next.js, leveraging modern web technologies to create a real-time messaging application.

## Features
- Real-time messaging
- User authentication with Clerk
- Dark/Light theme support
- Video calling with ZegoCloud
- Responsive UI with Tailwind CSS
- State management with Zustand
- Backend powered by Convex

## Tech Stack
- **Frontend**: 
  - React 19
  - Next.js 15
  - Tailwind CSS
- **Authentication**: Clerk
- **Backend**: Convex
- **Real-time Communication**: 
  - ZegoCloud (Video Calls)
  - WebSocket-based messaging
- **State Management**: Zustand
- **UI Components**: Radix UI, Lucide React

## Prerequisites
- Node.js (v20+)
- npm or yarn

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/whatsapp-clone.git
cd whatsapp-clone
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file with the following:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- Convex deployment variables
- ZegoCloud credentials

4. Run the development server
```bash
npm run dev
```

## Key Project Structures
- `src/components/`: Reusable UI components
- `src/app/`: Next.js app router pages
- `convex/`: Backend logic and database schema
- `src/store/`: State management
- `src/hooks/`: Custom React hooks
- `src/lib/`: Utility functions

## Main Features
- User Authentication
- One-to-One and Group Messaging
- Video Calling
- Theme Switching
- Responsive Design

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Deployment
The project is set up for easy deployment:
- Vercel (recommended for Next.js)
- Convex for backend
- Clerk for authentication

## License
Distributed under the MIT License.

## Contact
Reach out for any questions or support.
