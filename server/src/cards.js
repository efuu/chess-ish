// Card definitions for Chess-ish.
// `count` = how many copies of this card go into the deck.

export const CARDS = [
  {
    id: 'drag_queen',
    name: 'Drag Queen',
    count: 2,
    description:
      'Played on a king. Turns the king into a queen for one turn (can still be checkmated). Moves like a queen but cannot capture — instead "reads" pieces, freezing them for a turn from emotional damage.',
  },
  {
    id: 'horse_tranq',
    name: 'Horse Tranq',
    count: 1,
    description:
      'Played on a knight (yours or opponent\'s). Roll a d6: 1 = knight dies; 2-3 = stuck on one square for a turn; 4-5 = high, must move 4 or 5 times without capturing; 6 = high but good, may make a 3x5 L-move for two turns.',
  },
  {
    id: 'homophobia',
    name: 'Homophobia',
    count: 3,
    description:
      'Played on both bishops. Only works if both bishops are still on the board. Counters Drag Queen or Gay.',
  },
  {
    id: 'spain_without_the_a',
    name: 'Spain Without the A',
    count: 4,
    description: 'Flip the board. Play that way for two turns, then flip back.',
  },
  {
    id: 'blood_ritual',
    name: 'Blood Ritual',
    count: 1,
    description: 'Played on a rook. Sacrifice three of your pawns to turn it into a queen.',
  },
  {
    id: 'sugar_high',
    name: 'Sugar High',
    count: 3,
    description:
      'Played on a pawn. It can move two squares on its next turn regardless of where it is on the board.',
  },
  {
    id: 'eurus',
    name: 'Eurus',
    count: 3,
    description: 'Played on a pawn. That pawn can move one square to the right.',
  },
  {
    id: 'zephyrus',
    name: 'Zephyrus',
    count: 3,
    description: 'Played on a pawn. That pawn can move one square to the left.',
  },
  {
    id: 'uno_reverse',
    name: 'Uno Reverse',
    count: 1,
    description:
      "Played on opponent's turn. If they take a piece, you take theirs and move your formerly-taken piece to their square. Also reverses the effect of any card they play onto themselves.",
  },
  {
    id: 'violence_is_the_answer',
    name: 'Violence is the Answer',
    count: 1,
    description:
      'Played only at the start of the game. Arm wrestle. Loser picks one of their pieces (not pawn or king) to lose.',
  },
  {
    id: 'gambling',
    name: 'Gambling',
    count: 1,
    description:
      'Played at the beginning of your turn. Discard this card, draw three, keep one. If your name is Jimin Lim (gambling addict), you may do this twice with only one card.',
  },
  {
    id: 'steal',
    name: 'Steal',
    count: 3,
    description: "Played at the beginning of your turn. Discard this card and steal one of your opponent's cards.",
  },
  {
    id: 'hot_woman',
    name: 'Hot Woman',
    count: 1,
    description:
      'Played on your queen. The queen seduces the opponent king and pulls it out of castled position to the half-way row, same column.',
  },
  {
    id: 'discord',
    name: 'Discord',
    count: 1,
    description:
      'Played on an opponent pawn. The child gets groomed and is depressed — can no longer move two spaces on its first move.',
  },
  {
    id: 'restraining_order',
    name: 'Restraining Order',
    count: 1,
    description:
      "Played on a pawn against any knight or bishop. Forces that piece to move away if it is in any square adjacent to the pawn's square.",
  },
  {
    id: 'popular_loses_to_the_nerd',
    name: 'Popular Loses to the Nerd',
    count: 1,
    description:
      'If there is a crowd, ask them to cheer for their favorite player without telling them what will happen. Whoever gets cheered for loses the ability to promote pawns at the end of the board.',
  },
  {
    id: 'dare',
    name: 'Dare',
    count: 2,
    description: 'Played at the end of your turn. Opponent must do a dare or sacrifice a piece (can be a pawn).',
  },
  {
    id: 'truth',
    name: 'Truth',
    count: 2,
    description: 'Played at the end of your turn. Opponent must tell a truth or sacrifice a piece (can be a pawn).',
  },
  {
    id: 'history',
    name: 'History',
    count: 1,
    description: 'Played only at the very beginning of the game. Name an event; set up the board to look like that event.',
  },
  {
    id: 'russian_roulette',
    name: 'Russian Roulette',
    count: 1,
    description:
      'Played when pieces are traded. Roll a die every turn. 1 = lose a piece. 2 = discard a card. 3 = take an extra turn. 4 = give a card. 5 = nothing. 6 = roll again, this time for your opponent. Either player may stop at any time.',
  },
  {
    id: 'eye_see_you',
    name: 'Eye See You',
    count: 1,
    description: 'Played whenever. Have a staring contest. Does not affect the game in any way.',
  },
  {
    id: 'communism',
    name: 'Communism',
    count: 1,
    description:
      'King becomes a dictator and cannot move, but all your pieces (including pawns) can move like a queen restricted to the 5x5 grid centered on its current square. Lasts three moves or until America is played. If your name is Panth Shah (master communist), this card cannot be countered by America.',
  },
  {
    id: 'america',
    name: 'America',
    count: 1,
    description:
      'Played on a pawn as your turn. The pawn is given a gun and may shoot any piece in its row or column without moving. Lasts one turn, then the pawn is arrested and removed for a turn. Re-enters at the start of the second turn after this card is played.',
  },
  {
    id: 'shank',
    name: 'Shank',
    count: 3,
    description: 'Played on a pawn. It can capture forward for one turn.',
  },
  {
    id: 'good_east_asian_child',
    name: 'Good East Asian Child',
    count: 1,
    description:
      'Played on your opponent. They must move pieces with only chopsticks for the next three turns. If a piece is dropped, it returns to its origin square.',
  },
  {
    id: 'identity_theft',
    name: 'Identity Theft',
    count: 1,
    description: "Played on an opponent's non-monarch piece, turning it into a pawn for one turn.",
  },
];
