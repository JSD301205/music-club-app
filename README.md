# 🎵 Music Club - IIITDM Kancheepuram

[![Next.js](https://img.shields.io/badge/Next.js-13+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.6-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

The official website for the Music Club of IIITDM Kancheepuram, built with modern web technologies to showcase club activities, events, and member information.

## 🚀 Features

### Core Features
- 🎵 **Interactive Homepage** with animated sections and modern UI
- 📱 **Responsive Design** for all devices
- 🎨 **Modern UI/UX** with smooth animations
- 🌓 **Dark Mode** support
- 🔧 **Admin Interface** for content management
- 🛡️ **Role-Based Access** (Admin, Member, Enthusiast)
- 🔐 **Supabase Authentication & Profile System**
- 📝 **Profile Completion Enforcement** (required for community/jam-board)
- 💬 **Group Chat & Direct Messaging** (with profile-based restrictions)
- 📧 **Password Reset & Email Verification**
- �️ **Avatar Upload & Cropping**
- 🏷️ **Event & Gallery Management**
- 🏆 **Jam Board** for collaborative posts
- 🗂️ **Community Directory** with role badges
- 🛠️ **Admin Tools** for gallery/events

### Sections
1. **Hero Section**
   - Dynamic background with gradient effects
   - Call-to-action buttons for events and membership

2. **About Section**
   - Club history and mission
   - Key features and activities:
     - Regular Jam Sessions
     - Instrument Training
     - Vocal Workshops
     - Live Performances

3. **Gallery Section**
   - Filterable photo gallery
   - Categories: Performances, Workshops, Jam Sessions
   - Smooth animations and transitions
   - Lightbox image viewer

4. **Events Section**
   - Upcoming and past events
   - Event details including date, time, and location
   - Registration links for events
   - Event categories and filtering

5. **Contact Section**
   - Contact form with validation
   - Social media links
   - Club location and contact information

6. **Team Pages**
   - Dedicated pages for 2024 and 2025 teams
   - Team member profiles
   - Role-based organization

7. **Admin Dashboard**
   - Easy content management for gallery items and events
   - Form-based interface for adding new content
   - Automatic ID generation and position management
   - One-click code copying for seamless updates

8. **Community & Messaging**
   - Community directory with role badges
   - Direct messaging (cannot message yourself)
   - Group chat (with deployment guide)
   - Profile completion required for access

9. **Profile Setup**
   - Enthusiasts: Only bio, genres, batch year required
   - Members: Bio, instruments, genres, batch year required
   - Avatar upload and cropping
   - Spotify playlist link (optional)

10. **Security & Access**
   - Middleware restricts access to protected routes for incomplete profiles
   - Password reset and email verification flows

## 🛠️ Technical Stack

### Frontend
- **Framework**: Next.js 13+ with App Router
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: React Icons
- **Carousel**: React Slick
- **Type Safety**: TypeScript

### Backend
- **Serverless Functions**: Firebase Functions
- **Authentication**: Firebase Admin SDK
- **Email Service**: Nodemailer

## 📁 Project Structure

```
music-club-app/
├── client/                      # Next.js frontend application
│   ├── app/                    # App router pages and layouts
│   │   ├── (routes)/          # Route groups
│   │   │   ├── about/        # About page
│   │   │   ├── contact/      # Contact page
│   │   │   ├── events/       # Events page
│   │   │   ├── gallery/      # Gallery page
│   │   │   └── team/         # Team pages
│   │   ├── admin/            # Admin dashboard
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # Reusable React components
│   │   ├── common/          # Shared components
│   │   ├── layout/          # Layout components
│   │   └── sections/        # Page sections
│   ├── styles/              # Global styles and Tailwind config
│   ├── public/              # Static assets
│   │   ├── images/         # Image assets
│   │   └── icons/          # Icon assets
│   └── types/              # TypeScript type definitions
│
├── server/                  # Firebase Functions backend
│   ├── src/                # Source code
│   │   ├── functions/      # Cloud functions
│   │   │   ├── contact/    # Contact form handler
│   │   │   └── events/     # Events management
│   │   └── utils/          # Utility functions
│   └── lib/                # Compiled JavaScript
│
├── .env.local              # Client environment variables
├── .env                    # Server environment variables
├── firebase.json           # Firebase configuration
├── next.config.js          # Next.js configuration
├── package.json            # Root package.json
└── README.md               # Project documentation
```

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/Harith-Y/music-club-app.git
cd music-club-app
```

2. Install dependencies for both client and server:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables:
   - Create a `.env.local` file in the client directory
   - Create a `.env` file in the server directory
   - Add the required environment variables (see `.env.example` files)

4. Start the development servers:
```bash
# Start client development server
cd client
npm run dev

# Start server emulator (in a separate terminal)
cd server
npm run serve
```

## 🔧 Configuration

### Environment Variables
Client-side variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Server-side variables:
```
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
```

## 📚 API Documentation

### Contact Form API
Endpoint: `/api/contact`
Method: POST
Body:
```json
{
  "name": "string",
  "email": "string",
  "message": "string"
}
```

Response:
```json
{
  "success": boolean,
  "message": "string"
}
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend services
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [React Icons](https://react-icons.github.io/react-icons/) - Icon library

## 📞 Contact

For any queries or support, please reach out to:
- Email: [musicclub.iiitdm@gmail.com](mailto:musicclub.iiitdm@gmail.com)
- Website: [https://music-club-iiitdm.vercel.app](https://music-club-iiitdm.vercel.app)


## 🔄 Recent Updates
- 📱 **Enhanced Mobile Responsiveness** with improved UI/UX for all screen sizes
- 🎨 **Refined UI Components** with smoother animations and transitions
- 📝 **Legal Pages** added:
  - Privacy Policy
  - Terms of Service
- 🎵 **Expanded Events Section** with:
  - Detailed event categories
  - YouTube video integration
  - Event registration links
  - Gallery routes for events
- 📞 **Enhanced Contact Section** with:
  - Detailed club hours
  - Physical location information
  - Multiple contact methods
  - Social media integration
- 🔧 **Admin Dashboard** with:
  - Form-based interface for adding gallery items and events
  - Automatic ID generation and position management
  - One-click code copying for seamless updates
  - Smart handling of apostrophes in titles

---

Last Updated: March 2024
Built with ❤️ by the Music Club Team at IIITDM Kancheepuram
