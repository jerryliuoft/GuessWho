// Centralized demo set for Guess Who?
export const DEMO_SET: CharacterSet = {
  name: 'Demo Set',
  characters: [
    {
      name: 'Alice',
      imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    { name: 'Bob', imageUrl: 'https://randomuser.me/api/portraits/men/65.jpg' },
    {
      name: 'Clara',
      imageUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
    },
    {
      name: 'David',
      imageUrl: 'https://randomuser.me/api/portraits/men/66.jpg',
    },
    {
      name: 'Eva',
      imageUrl: 'https://randomuser.me/api/portraits/women/66.jpg',
    },
    {
      name: 'Frank',
      imageUrl: 'https://randomuser.me/api/portraits/men/67.jpg',
    },
    {
      name: 'Grace',
      imageUrl: 'https://randomuser.me/api/portraits/women/67.jpg',
    },
    {
      name: 'Henry',
      imageUrl: 'https://randomuser.me/api/portraits/men/68.jpg',
    },
    {
      name: 'Ivy',
      imageUrl: 'https://randomuser.me/api/portraits/women/69.jpg',
    },
    {
      name: 'Jack',
      imageUrl: 'https://randomuser.me/api/portraits/men/69.jpg',
    },
    {
      name: 'Karen',
      imageUrl: 'https://randomuser.me/api/portraits/women/70.jpg',
    },
    { name: 'Leo', imageUrl: 'https://randomuser.me/api/portraits/men/70.jpg' },
    {
      name: 'Mona',
      imageUrl: 'https://randomuser.me/api/portraits/women/71.jpg',
    },
    {
      name: 'Nate',
      imageUrl: 'https://randomuser.me/api/portraits/men/71.jpg',
    },
    {
      name: 'Olivia',
      imageUrl: 'https://randomuser.me/api/portraits/women/72.jpg',
    },
    {
      name: 'Paul',
      imageUrl: 'https://randomuser.me/api/portraits/men/72.jpg',
    },
  ],
};
export interface Character {
  name: string;
  imageUrl: string;
}

export interface CharacterSet {
  name: string;
  characters: Character[];
}
