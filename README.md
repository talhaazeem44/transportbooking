# Toronto Airport Limo Service

Premium limousine and luxury transportation services booking system with admin panel.

## Features

- 🚗 **User Booking System** - Online reservation form
- 👨‍💼 **Admin Panel** - Full CRUD for vehicles, services, and reservations
- 🔔 **Real-time Notifications** - Socket.IO powered admin notifications
- 📧 **Email Notifications** - Automatic email alerts for new reservations
- 📱 **Responsive Design** - Mobile-friendly interface
- 🔐 **Admin Authentication** - Secure login system

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Backend:** Next.js API Routes, Socket.IO
- **Database:** MongoDB (Mongoose)
- **Email:** Nodemailer
- **Authentication:** bcryptjs, cookies

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd transportbooking
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create `.env.local` file:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/transportbooking
   MONGODB_DB=transportbooking
   
   ADMIN_EMAIL_TO=your-email@gmail.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@gmail.com
   
   ADMIN_TOKEN_SECRET=your-secret-key
   ```

4. **Seed Database:**
   ```bash
   npm run db:seed
   ```

5. **Create Admin User:**
   ```bash
   npm run admin:create admin admin123
   ```

6. **Start Development Server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Admin Panel

- **URL:** `/admin`
- **Default Credentials:**
  - Username: `admin`
  - Password: `admin123`

## Project Structure

```
├── app/
│   ├── admin/          # Admin panel pages
│   ├── api/            # API routes
│   └── page.tsx        # Home page
├── components/         # React components
├── lib/                # Utilities (MongoDB, auth, email, socket)
├── models/             # Mongoose models
├── public/             # Static files
├── scripts/            # Database scripts
└── server.js           # Custom server with Socket.IO
```

## Scripts

- `npm run dev` - Start development server (with Socket.IO)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:seed` - Seed initial data
- `npm run admin:create` - Create admin user

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy (Vercel)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

**Note:** Socket.IO requires persistent connections. Consider Railway or Render for full Socket.IO support.

## License

Private project
