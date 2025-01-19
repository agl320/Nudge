import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { emailAndPasswordSignIn } from "@/service/firebaseContext";
import { Separator } from "../ui/separator";
import { GoogleSignIn, UserSignOut } from "@/service/firebaseContext";

const formSchema = z.object({
    email: z.string().min(2).max(50),
    password: z.string().min(8).max(50),
});

interface LoginFormProps {
    setIsOnRegister: (value: boolean) => void;
}

export default function LoginForm({ setIsOnRegister }: LoginFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    function onSubmitHandler(values: z.infer<typeof formSchema>) {
        emailAndPasswordSignIn(values.email, values.password);
    }

    return (
        <div className="rounded-lg p-8 backdrop-blur-sm">
            <div className="text-center space-y-4 mb-8">
                <h2 className="text-2xl font-mono">
                    <span className="text-green-400">$</span> System Access
                </h2>
                <p className="font-mono text-sm opacity-75">
                    $ authenticate --user --grant-access
                </p>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmitHandler)}
                    className="space-y-8 mx-auto"
                >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    <span className="text-green-400">$</span>{" "}
                                    Email
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="User@domain.com"
                                        {...field}
                                        className="text-white/75"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    <span className="text-green-400">$</span>{" "}
                                    Password
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Password"
                                        type="password"
                                        {...field}
                                        className="text-white/75"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="bg-green-500 text-white w-full font-mono"
                    >
                        Login
                    </Button>
                </form>
            </Form>
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
                    <span className="block">
                        <span className="text-green-400">{">"}</span> Need an
                        account?{"\t"}
                        <Button
                            onClick={() => setIsOnRegister(true)}
                            className="text-green-500 hover:text-green-400"
                        >
                            Register
                        </Button>
                    </span>
                </div>
            </div>
        </div>
    );
}
