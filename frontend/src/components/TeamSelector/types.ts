export interface TeamSelectorProps {
   /** List of all available teams */
   teams: string[];
   /** Currently selected teams */
   selectedTeams: string[];
   /** Callback when team selection changes */
   onTeamsChange: (teams: string[]) => void;
   /** Loading state */
   isLoading?: boolean;
   /** Error message if loading failed */
   error?: string | null;
 }