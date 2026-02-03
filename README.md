# Rwanda Technology Institute Management System

A comprehensive university management system built with Next.js 14, featuring role-based access control for administrators, teachers, and students.

## 🚀 Features

- **Role-Based Access Control**: Admin, Teacher, and Student roles with appropriate permissions
- **Secure Authentication**: NextAuth.js with JWT sessions and password hashing
- **Modern UI**: Responsive design with Tailwind CSS and Lucide icons
- **Database**: MongoDB Atlas with Mongoose ODM
- **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js v5
- **Database**: MongoDB Atlas with Mongoose
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd school_management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   # MongoDB Atlas Connection
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

   # Auth.js Configuration
   AUTH_SECRET=your-super-secure-random-secret
   AUTH_URL=https://your-vercel-domain.vercel.app

   # Cloudinary (optional)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Email (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment to Vercel

### Step 1: Prepare Your Code
1. Push your code to GitHub
2. Ensure all environment variables are set

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `AUTH_SECRET`
   - `AUTH_URL` (set to your Vercel domain)
   - Other variables as needed

5. Click "Deploy"

### Step 3: Update MongoDB Atlas
1. Go to MongoDB Atlas → Network Access
2. Add `0.0.0.0/0` (allow all IPs) for development
3. For production, add your Vercel IP or use VPC peering

## 👥 User Roles

### Administrator
- Full system access
- User management
- System configuration
- View all data

### Teacher
- View assigned students
- Access class management
- View attendance records
- Manage grades

### Student
- View personal dashboard
- Access enrolled classes
- View grades and schedule
- Download documents

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard pages
│   └── register/          # Registration page
├── components/            # Reusable components
├── lib/                   # Utility functions
├── models/                # MongoDB models
└── middleware.ts          # Route protection
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📄 License

This project is private and proprietary to Rwanda Technology Institute.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📞 Support

For technical support, contact the development team.
