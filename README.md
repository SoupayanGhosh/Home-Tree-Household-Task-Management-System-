# 🏠 Home-Tree: Your Family Management Hub

[![Next.js](https://img.shields.io/badge/Next.js-15.0+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

Home-Tree is a comprehensive family management application designed to streamline household coordination, task management, and communication between family members.

## ✨ Features

### 🎯 Core Features

- **Family Dashboard**: Centralized hub for family activities and notifications
- **Task Management**: Create, assign, and track family tasks
- **Grocery List**: Collaborative shopping list with real-time updates
- **Bill Management**: Track and manage household expenses
- **Medicine Tracker**: Keep track of family medications and schedules
- **Family Chat**: Built-in messaging system for family communication
- **Document Storage**: Organize and share important family documents
- **Calendar Integration**: Schedule and manage family events

### 💡 Key Highlights

- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Instant notifications and changes
- **Role-based Access**: Customizable permissions for family members
- **Intuitive Interface**: User-friendly design with modern UI components

## 🚀 Tech Stack

### Frontend

- **Next.js 13+**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: High-quality UI components
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Beautiful, consistent icons

### Backend

- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: MongoDB object modeling
- **NextAuth.js**: Authentication solution
- **REST API**: Clean and intuitive API endpoints

## 📦 Dependencies

### Core Dependencies

```json
{
  "next": "^13.x",
  "react": "^18.x",
  "react-dom": "^18.x",
  "typescript": "^5.x",
  "tailwindcss": "^3.x",
  "mongoose": "^7.x",
  "next-auth": "^4.x"
}
```

### UI Components

- `@radix-ui/*`: For accessible UI primitives
- `@shadcn/ui`: For styled components
- `lucide-react`: For icons
- `react-hot-toast`: For notifications

## 🛠️ Getting Started

# or

pnpm dev

# or

bun dev

1. **Clone the repository**

   ```bash
   git clone https://github.com/SoupayanGhosh/Home-Tree-Household-Task-Management-System-
   cd Home-Tree
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:

   ```env
   MONGODB_URI=your_mongodb_uri
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

You can also access the live demo at: [https://home-tree.vercel.app/](https://home-tree.vercel.app/)

> Note: The live demo is hosted on a free plan, so there might be some initial delay. Refreshing the page usually helps.

## 🔧 Configuration

### Database Setup

1. Create a MongoDB database
2. Update the connection string in `.env.local`
3. Models will be automatically created on first run

### Authentication

- Configure NextAuth.js providers in `src/app/api/auth/[...nextauth]/options.ts`
- Add additional providers as needed

## 📱 Mobile Support

- Responsive design works on all devices
- Touch-friendly interface
- Mobile-first approach

## 🔒 Security Features

- Secure authentication with NextAuth.js
- Protected API routes
- Role-based access control
- Input validation and sanitization

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.
project is underdevelopment, considerable delays are expected since its using free hosting services, refreshing often helps, not all elements of the project are upto 100% functionality, however with future updates we are trying to add more features and resolve issues.
## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---
