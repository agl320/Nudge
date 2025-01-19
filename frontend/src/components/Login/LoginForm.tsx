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

const formSchema = z.object({
    email: z.string().min(2).max(50),
    password: z.string().min(8).max(50),
});

function LoginForm() {
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
                                <span className="text-green-400">$</span> Email
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
                    className="bg-green-500 text-white w-full"
                >
                    Log In
                </Button>
            </form>
        </Form>
    );
}
export default LoginForm;
