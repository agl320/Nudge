import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
    GoogleSignIn,
    emailAndPasswordSignUp,
} from "@/service/firebaseContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input";

const formSchema = z.object({
    email: z.string().min(2).max(50),
    password: z.string().min(8).max(50),
});

interface RegisterFormProps {
    setIsOnRegister: (value: boolean) => void;
}

export function RegisterForm({ setIsOnRegister }: RegisterFormProps) {
    const navigate = useNavigate();
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmitHandler(values: z.infer<typeof formSchema>) {
        try {
            await emailAndPasswordSignUp(values.email, values.password);
            setMessage({
                type: "success",
                text: "Registration successful! Redirecting to login...",
            });
            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch (error) {
            setMessage({
                type: "error",
                text:
                    error instanceof Error
                        ? error.message
                        : "Registration failed. Please try again.",
            });
        }
    }

    return (
        <div className="rounded-lg px-8 backdrop-blur-sm">
            {message && (
                <Alert
                    className={`mb-4 ${
                        message.type === "success"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-red-500/20 text-red-500"
                    }`}
                >
                    <AlertDescription>{message.text}</AlertDescription>
                </Alert>
            )}

            <div className="text-center space-y-4 mb-8">
                <h2 className="text-2xl font-medium">Start Saving Time</h2>
                <p className=" text-sm opacity-75 bg-white/15 inline-block py-2 px-4 rounded-md">
                    $ sudo create-account --type=user
                </p>
            </div>

            <form
                className="space-y-8 mx-auto"
                onSubmit={form.handleSubmit(onSubmitHandler)}
            >
                <div className="space-y-2">
                    <label className="block  text-sm">
                        <span className="text-green-400">$</span> Email
                    </label>
                    <Input
                        {...form.register("email")}
                        type="email"
                        className="w-full"
                        placeholder="User@domain.com"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block  text-sm">
                        <span className="text-green-400">$</span> Password
                    </label>
                    <Input
                        {...form.register("password")}
                        type="password"
                        className="w-full border rounded-md text-white/75 text-sm"
                        placeholder="Password"
                    />
                </div>
                <Button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-400 text-white "
                >
                    Register
                </Button>
            </form>

            <div className="space-y-8 mt-8">
                <div className="flex justify-center">
                    <div className="flex flex-col justify-center">
                        <Separator className="bg-white/50 w-[150px]" />
                    </div>

                    <p className="opacity-50 text-xs mx-2">OR</p>
                    <div className="flex flex-col justify-center">
                        <Separator className="bg-white/50 w-[150px]" />
                    </div>
                </div>
                <div className="flex justify-center">
                    <GoogleSignIn />
                </div>
                <div className="flex justify-center">
                    <span className="block  text-sm">
                        <span className="text-green-400">{">"}</span> Already
                        registered?{" "}
                        <Button
                            onClick={() => setIsOnRegister(false)}
                            className="text-green-500 hover:text-green-400"
                        >
                            Login
                        </Button>
                    </span>
                </div>
            </div>
        </div>
    );
}
