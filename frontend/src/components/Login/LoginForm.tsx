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
        // doSignInWithEmailAndPassword(values.email, values.password);
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
                            <FormLabel>$ Email</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Email"
                                    {...field}
                                    className="text-white"
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
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Password"
                                    type="password"
                                    {...field}
                                    className="text-white"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type="submit" className="bg-white text-black w-full">
                    Log In
                </Button>
            </form>
        </Form>
    );
}
export default LoginForm;
