"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {toast} from "sonner"
import Image from "next/image";
import { useRouter } from "next/router";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import { LockKeyhole, Mail } from "lucide-react";
import { IoPersonOutline } from "react-icons/io5";

export default function Home() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false);
    const [isSignup, setIsSignup] = useState(false)
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let response;
            if(isSignup){
                if(confirmPassword != password){
                    toast.error("Confirm password is not matched with password")
                    return;
                }
                response = await fetch("/api/auth", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        action: "signup",
                        name,
                        email,
                        password,
                    }),
                });
            }
            response = await fetch("/api/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "login",
                    email,
                    password,
                }),
            });
            const data = await response.json();
            if (data.token) {
                Cookies.set("token", data.token);
                router.push("/");
            }
            console.log(data);
        } catch (error) {
            console.log(error);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Image className="absolute top-5 left-5" src="/logo.png" alt="Logo" width={80} height={100} />
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <div className="flex justify-center mb-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <LockKeyhole className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
                        <CardDescription className="text-center">
                            Enter your email and password to login to your account
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {isSignup && 
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <div className="relative">
                                    <IoPersonOutline className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        placeholder="name"
                                        type="text"
                                        className="pl-9"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            }
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        className="pl-9"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Button variant="link" className="px-0 text-xs">
                                        Forgot password?
                                    </Button>
                                </div>
                                <div className="relative">
                                    <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        className="pl-9"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            {isSignup && 
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Confirm Password</Label>
                                </div>
                                <div className="relative">
                                    <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirm_password"
                                        type="password"
                                        className="pl-9"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            }
                        </CardContent>
                        <div className="flex justify-end px-6">
                            {isSignup ? 
                            <Button variant="link" className="cursor-pointer px-0 text-xs" onClick={()=>{setIsSignup(false)}}>
                                Login
                            </Button>
                            :
                            <Button variant="link" className="cursor-pointer px-0 text-xs" onClick={()=>{setIsSignup(true)}}>
                                Create new account
                            </Button>
                            }
                        </div>
                        <CardFooter className="flex flex-col space-y-4 mt-10">
                            <Button type="submit" className="w-full cursor-pointer">
                                {!loading ? (isSignup ? "Sign up":"Sign in") : "Processing..."}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </>
    );
}
