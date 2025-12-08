import DonkeyLogo from './DonkeyLogo';

const Header = () => {
  return (
    <header className="gradient-hero text-primary-foreground py-6 px-4 shadow-elevated">
      <div className="container mx-auto flex items-center justify-center gap-4">
        <DonkeyLogo className="w-16 h-16 animate-bounce-soft" />
        <div className="text-center">
          <h1 className="font-display text-4xl md:text-5xl tracking-wide">
            PELADA DOS AMIGOS
          </h1>
          <p className="text-primary-foreground/80 text-sm mt-1 font-medium">
            Organize suas partidas com estilo
          </p>
        </div>
        <DonkeyLogo className="w-16 h-16 animate-bounce-soft hidden md:block" />
      </div>
    </header>
  );
};

export default Header;
