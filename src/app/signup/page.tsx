'use client';

import { useState, KeyboardEvent } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown, Shield, Swords, Flag } from 'lucide-react';
import { signUp } from '@/lib/actions/auth';
import { signIn } from 'next-auth/react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  // CORREÇÃO DO TIPO: string | null
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email || !password || !name) {
      setError('Please provide name, email, and password');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await signUp(email, password, name);

      // Auto-login after registration
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
      });
    } catch (err: any) {
      setError(err.message ?? "An error occurred while creating your account");
      setLoading(false);
    }
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
        <div className="absolute top-10 right-10 opacity-10">
          <Flag className="w-32 h-32 text-primary animate-float" />
        </div>
        <div className="absolute bottom-10 left-10 opacity-10">
          <Shield className="w-40 h-40 text-accent" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute top-1/3 right-1/4 opacity-5">
          <Swords className="w-24 h-24 text-primary" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>

      <Card className="w-full max-w-md relative z-10 border-2 border-primary/20 shadow-royal backdrop-blur-sm bg-card/95">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-glow">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary animate-glow uppercase tracking-tighter">
            Join the Realm
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Create your account and begin your imperial journey
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium">
              Commander Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your governor name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyPress}
              className="bg-input border-border focus:border-primary focus:ring-primary/50 transition-royal"
            />
          </div>

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

          <div className="text-[10px] text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border leading-tight">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </div>
          <div className="text-[10px] text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border leading-tight">
            By creating an account, you will have access immediately.
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary-glow text-primary-foreground font-bold shadow-royal hover:shadow-glow transition-royal disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Forging Alliance...
              </div>
            ) : (
              'Register'
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already a governor?{' '}
            <a
              href="/login"
              className="text-primary hover:text-primary-glow font-semibold transition-colors"
            >
              Log In
            </a>
          </div>
        </CardFooter>
      </Card>

      {/* Decorative bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
    </div>
  );
}