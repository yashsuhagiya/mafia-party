export interface RoleDescription {
  type: 'M' | 'V' | 'N'; // Mafia, Village, Neutral
  description: string;
  player: string;
  narrator: string;
}

export interface RoleDescriptions {
  [key: string]: RoleDescription;
}

export interface Player {
  name: string;
  hook?: string;
}

export interface AllocatedPlayer {
  alive: boolean;
  allotedRole: string;
  type: 'M' | 'V' | 'N';
}

export interface RoleCount {
  [roleName: string]: number;
}
