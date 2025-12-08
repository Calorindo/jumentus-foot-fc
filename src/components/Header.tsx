import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import logo from "../assets/LOGO_JUMENTUS.svg";

const Header = () => {
  const { signOut, user } = useAuth();

  return (
    <header className="gradient-hero text-primary-foreground py-4 md:py-6 px-4 shadow-elevated">
      <div className="container mx-auto flex items-center justify-between gap-2">
        <img src={logo} alt="TESTE FC" className="w-12 h-12 md:w-16 md:h-16 animate-bounce-soft" />
        <div className="text-center flex-1 min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl md:text-5xl tracking-wide truncate">
            Jumentus FC
          </h1>
          <p className="text-primary-foreground/80 text-xs sm:text-sm mt-1 font-medium hidden sm:block">
            Controle de partidas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <img src={logo} alt="TESTE FC" className="w-12 h-12 md:w-16 md:h-16 animate-bounce-soft" />
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 md:h-10 md:w-10"
            >
              <LogOut className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
