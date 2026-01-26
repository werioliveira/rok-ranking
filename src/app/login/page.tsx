'use client';

import { signIn } from 'next-auth/react';
import { useState, KeyboardEvent } from 'react'; // Adicionado KeyboardEvent para tipagem
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown, Shield, Swords } from 'lucide-react';
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // CORREÇÃO DO TIPO: Agora aceita string ou null
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/");
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 opacity-10">
          <Crown className="w-32 h-32 text-primary animate-float" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-10">
          <Shield className="w-40 h-40 text-primary" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute top-1/2 left-1/4 opacity-5">
          <Swords className="w-24 h-24 text-accent" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>

      <Card className="w-full max-w-md relative z-10 border-2 border-primary/20 shadow-royal backdrop-blur-sm bg-card/95">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary animate-glow uppercase tracking-tighter">
            Enter the Realm
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Access your account and command your armies
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="commander@realm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}
              className="bg-input border-border focus:border-primary focus:ring-primary/50 transition-royal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">
              Secret Key (Password)
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
              className="bg-input border-border focus:border-primary focus:ring-primary/50 transition-royal"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="border-destructive/50">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
              <input type="checkbox" className="rounded border-border accent-primary" />
              Remember me
            </label>
            <a href="#" className="text-primary hover:text-primary-glow transition-colors font-medium">
              Lost your password?
            </a>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-accent text-primary-foreground font-bold shadow-royal hover:shadow-glow transition-royal disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Marching into account...
              </div>
            ) : (
              'Enter the Kingdom'
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            New governor?{' '}
            <a
              href="/signup"
              className="text-primary hover:text-primary-glow font-semibold transition-colors"
            >
              Create Account
            </a>
          </div>
        </CardFooter>
      </Card>

      {/* Decorative bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
    </div>
  );
}