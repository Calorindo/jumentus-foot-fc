import { Button } from '@/components/ui/button';
import { Users, Shuffle, Gamepad2, BarChart3, Award } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  matchActive: boolean;
  votingActive?: boolean;
}

const Navigation = ({ activeTab, onTabChange, matchActive, votingActive = false }: NavigationProps) => {
  const tabs = [
    { id: 'players', label: 'Jogadores', icon: Users },
    { id: 'teams', label: 'Times', icon: Shuffle },
    { id: 'match', label: 'Partida', icon: Gamepad2, disabled: !matchActive },
    { id: 'voting', label: 'Votação', icon: Award },
    { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
  ];

  return (
    <nav className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.filter(tab => !tab.hidden).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDisabled = tab.disabled;

            return (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => !isDisabled && onTabChange(tab.id)}
                disabled={isDisabled}
                className={`flex-1 min-w-[70px] sm:min-w-[80px] rounded-none py-3 sm:py-4 px-2 sm:px-3 font-medium transition-all ${
                  isActive
                    ? 'text-primary border-b-2 border-primary bg-secondary/50'
                    : isDisabled
                    ? 'text-muted-foreground/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                }`}
              >
                <Icon className="w-4 h-4 sm:mr-2" />
                <span className="text-xs sm:text-sm hidden sm:inline">{tab.label}</span>
                {tab.id === 'match' && matchActive && (
                  <span className="ml-1 sm:ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
