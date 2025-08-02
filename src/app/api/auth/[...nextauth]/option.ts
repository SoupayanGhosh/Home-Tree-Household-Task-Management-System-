import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        await dbConnect();
        try {
            if (!credentials?.username || !credentials?.password) {
                throw new Error("Username and password required");
              }
            const user = await UserModel.findOne({
                $or: [
                    {email: credentials.username},
                    {username : credentials.username}
                ]
            })
            if(!user){
                throw new Error("No user found with this email")
            }

            const iscorrectpassword = await bcrypt.compare(credentials.password, user.password)
            if(iscorrectpassword){
              return user
            }
            else{
              throw new Error('Incorrect password try again')
            }
            
        } catch (err : any) {
            throw new Error(err)
        }
      }
    })
  ],
  pages : {
    signIn: '/sign-in'
  },
  session:{
    strategy : "jwt"
  },
  secret : process.env.NEXTAUTH_SECRET,
  callbacks:{
    async jwt({token, user}){
      if(user){
        token._id = user._id?.toString()
        token.isVerified = user.isVerified
        token.username = user.username
        token.email = user.email
      }
      return token
    },
    async session({session, token}){
      if(token){
        session.user._id = token._id
        session.user.username = token.username
        session.user.isVerified = token.isVerified
        session.user.email = token.email
      }
      return session
    }
  }
}
        