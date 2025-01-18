import NavBar from "../NavBar/NavBar";
import { Button } from "../ui/button";
import { Link } from "react-router";
import { Separator } from "../ui/separator";
import { Terminal } from "lucide-react";
import { GoogleSignIn } from "@/service/firebaseContext";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailAndPasswordSignUp } from "@/service/firebaseContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.string().min(2).max(50),
  password: z.string().min(8).max(50),
});

function Register() {
    const navigate = useNavigate();
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    
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
        setMessage({ type: 'success', text: 'Registration successful! Redirecting to login...' });
        // Redirect after a short delay to show the success message
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (error) {
        setMessage({ 
          type: 'error', 
          text: error instanceof Error ? error.message : 'Registration failed. Please try again.' 
        });
      }
    }

    return (
      <section className="w-screen min-h-screen h-full w-full px-16 bg-black">
        <NavBar />
        <div className="h-full lg:flex mx-auto max-w-6xl justify-center">
          <div className="lg:w-1/2 h-full bg-white p-8 py-16 my-8 ml-0 mr-4 rounded-md flex flex-col justify-center min-h-[300px] lg:min-h-[700px] text-center text-black">
            <Terminal className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl font-mono font-medium">
              <span className="text-green-600"> </span>Nudge.io
            </h1>
            <p className="mt-4 max-w-xs mx-auto font-mono">
              <span className="text-green-600">$</span> initialize_efficiency.sh
            </p>
            <div className="mt-8 font-mono text-sm">
              <p className="text-green-600">{">"} Loading modules...</p>
              <p className="text-green-600">{">"} Optimizing meetings...</p>
              <p className="text-green-600">{">"} Ready for deployment</p>
              <p className="mt-4 text-xs opacity-50 animate-pulse">[System Ready]</p>
            </div>
          </div>
          <div className="lg:w-1/2 m-8 text-white rounded-md flex flex-col justify-center p-8 py-16 mr-0 my-8 ml-4 min-h-[700px]">
            <div className="max-w-sm mx-auto">
              {message && (
                <Alert className={`mb-4 ${
                  message.type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                }`}>
                  <AlertDescription>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="text-center space-y-4 mb-8">
                <h2 className="text-2xl font-mono">
                  <span className="text-green-500"> </span>
                  New User Registration
                </h2>
                <p className="font-mono text-sm opacity-75">$ sudo create-account --type=user</p>
              </div>
              
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmitHandler)}>
                <div className="space-y-2">
                  <label className="block font-mono text-sm">
                    <span className="text-green-500">$ </span>
                    Email
                  </label>
                  <input
                    {...form.register("email")}
                    type="email"
                    className="w-full bg-black border border-green-500/30 rounded px-4 py-2 font-mono text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    placeholder="user@domain.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-mono text-sm">
                    <span className="text-green-500">$ </span>
                    Password
                  </label>
                  <input
                    {...form.register("password")}
                    type="password"
                    className="w-full bg-black border border-green-500/30 rounded px-4 py-2 font-mono text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    placeholder="****************"
                  />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 font-mono">
                  <span className="mr-2">$</span> Execute Registration
                </Button>
              </form>

              <div className="space-y-8 mt-8">
                <div className="flex justify-center">
                  <div className="flex flex-col justify-center">
                    <Separator className="bg-green-500/30 w-[150px]" />
                  </div>
                  <p className="opacity-50 text-xs mx-2 font-mono">OR</p>
                  <div className="flex flex-col justify-center">
                    <Separator className="bg-green-500/30 w-[150px]" />
                  </div>
                </div>
                <div className="flex justify-center">
                  <GoogleSignIn />
                </div>
                <div className="flex justify-center">
                  <span className="block font-mono text-sm">
                    <span className="text-green-500">{">"}</span> Already registered?{" "}
                    <Link to="/" className="text-green-500 hover:text-green-400">
                      Login
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
}

export default Register;