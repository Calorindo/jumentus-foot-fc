import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import logo from "../assets/LOGO_JUMENTUS.svg";

const Header = () => {
  const { signOut, user } = useAuth();

  return (
    <header className="gradient-hero text-primary-foreground py-6 px-4 shadow-elevated">
      <div className="container mx-auto flex items-center justify-between">
        <img src={logo} alt="TESTE FC" className="w-16 h-16 animate-bounce-soft hidden md:block" />
        <div className="text-center flex-1">
          <h1 className="font-display text-4xl md:text-5xl tracking-wide">
            Jumentus FC
          </h1>
          <p className="text-primary-foreground/80 text-sm mt-1 font-medium">
            Controle de partidas
          </p>
        </div>
        <div className="flex items-center gap-2">
        <img src={logo} alt="TESTE FC" className="w-16 h-16 animate-bounce-soft hidden md:block" />
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
