export interface Choice {
  id: string;
  choiceText: string;
  choiceTranslation: string;
  choiceAudioPath: string;
  /** Whether this response advances the learner's intended path. */
  isCorrect?: boolean;
  nextNodeId: string | 'END';
}

export interface DialogueNode {
  id: string;
  speaker: string;
  npcText: string;
  npcTranslation: string;
  npcAudioPath: string;
  /** CSS gradient string used as scene background */
  backgroundGradient: string;
  npcSprite: string;
  playerSprite: string;
  choices: Choice[];
}

export interface Level {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  startNodeId: string;
  nodes: Record<string, DialogueNode>;
}

const BG = {
  classroom:
    "linear-gradient(to bottom, rgba(10,5,30,0.06), rgba(10,5,30,0.18) 55%, rgba(10,5,30,0.72)), url('/backgrounds/classroom.png') center / cover no-repeat",
  playground:
    "linear-gradient(to bottom, rgba(10,5,30,0.04), rgba(10,5,30,0.14) 55%, rgba(10,5,30,0.70)), url('/backgrounds/playground.png') center / cover no-repeat",
  fruitMarket:
    "linear-gradient(to bottom, rgba(10,5,30,0.05), rgba(10,5,30,0.16) 55%, rgba(10,5,30,0.72)), url('/backgrounds/fruit-market.png') center / cover no-repeat",
};

export const LEVELS: Level[] = [
  {
    id: 1,
    title: 'Level 1',
    subtitle: 'The Classroom',
    icon: 'classroom',
    accentColor: '#38bdf8',
    startNodeId: 'c1',
    nodes: {
      c1: {
        id: 'c1',
        speaker: 'Teacher',
        npcText: 'अद्य भवतः गृहकार्यं समाप्तम् किम्?',
        npcTranslation: 'Is your homework done today?',
        npcAudioPath: '/audio/level1/c1_npc.mp3',
        backgroundGradient: BG.classroom,
        npcSprite: 'teacher',
        playerSprite: 'student',
        choices: [
          {
            id: 'c1a',
            choiceText: 'आम्, सर्वम् समाप्तम्।',
            choiceTranslation: 'Yes, all is finished.',
            choiceAudioPath: '/audio/level1/c1a.mp3',
            isCorrect: true,
            nextNodeId: 'c2a',
          },
          {
            id: 'c1b',
            choiceText: 'क्षम्यताम्, अहं क्रीडितुं इच्छामि।',
            choiceTranslation: 'Sorry, I want to play.',
            choiceAudioPath: '/audio/level1/c1b.mp3',
            isCorrect: false,
            nextNodeId: 'c2b',
          },
        ],
      },
      c2a: {
        id: 'c2a',
        speaker: 'Teacher',
        npcText: 'उत्तमम्! अधुना पाठं दर्शयतु।',
        npcTranslation: 'Excellent! Now show me the lesson.',
        npcAudioPath: '/audio/level1/c2a_npc.mp3',
        backgroundGradient: BG.classroom,
        npcSprite: 'teacher',
        playerSprite: 'student',
        choices: [
          {
            id: 'c2a1',
            choiceText: 'एषः मम गृहकार्यः।',
            choiceTranslation: 'This is my homework.',
            choiceAudioPath: '/audio/level1/c2a1.mp3',
            isCorrect: true,
            nextNodeId: 'END',
          },
          {
            id: 'c2a2',
            choiceText: 'क्षमताम्, अहं पुस्तकं विस्मृतम्।',
            choiceTranslation: 'Sorry, I forgot the book.',
            choiceAudioPath: '/audio/level1/c2a2.mp3',
            isCorrect: false,
            nextNodeId: 'END',
          },
        ],
      },
      c2b: {
        id: 'c2b',
        speaker: 'Teacher',
        npcText: 'प्रथमं गृहकार्यं समापयतु।',
        npcTranslation: 'First, finish your homework.',
        npcAudioPath: '/audio/level1/c2b_npc.mp3',
        backgroundGradient: BG.classroom,
        npcSprite: 'teacher',
        playerSprite: 'student',
        choices: [
          {
            id: 'c2b1',
            choiceText: 'न, अहं पुनः क्रीडिष्यामि।',
            choiceTranslation: 'No, I will play again.',
            choiceAudioPath: '/audio/level1/c2b1.mp3',
            isCorrect: false,
            nextNodeId: 'END',
          },
          {
            id: 'c2b2',
            choiceText: 'आम्, अधुना गृहकार्यं समाप्तं करिष्यामि।',
            choiceTranslation: 'Yes, I will finish the homework now.',
            choiceAudioPath: '/audio/level1/c2b2.mp3',
            isCorrect: true,
            nextNodeId: 'END',
          },
        ],
      },
    },
  },
  {
    id: 2,
    title: 'Level 2',
    subtitle: 'The Playground',
    icon: 'playground',
    accentColor: '#34d399',
    startNodeId: 'p1',
    nodes: {
      p1: {
        id: 'p1',
        speaker: 'Friend',
        npcText: 'अद्य सायङ्काले खेलनाथं आगच्छसि किम्?',
        npcTranslation: 'Are you coming to play this evening?',
        npcAudioPath: '/audio/level2/p1_npc.mp3',
        backgroundGradient: BG.playground,
        npcSprite: 'friend',
        playerSprite: 'player',
        choices: [
          {
            id: 'p1a',
            choiceText: 'आम्, अहं कन्दुकम् आनयामि।',
            choiceTranslation: 'Yes, I am bringing a ball.',
            choiceAudioPath: '/audio/level2/p1a.mp3',
            nextNodeId: 'p2a',
          },
          {
            id: 'p1b',
            choiceText: 'क्षम्यताम्, अद्य अध्ययनम् अस्ति।',
            choiceTranslation: 'Sorry, today I have to study.',
            choiceAudioPath: '/audio/level2/p1b.mp3',
            nextNodeId: 'p2b',
          },
        ],
      },
      p2a: {
        id: 'p2a',
        speaker: 'Friend',
        npcText: 'अस्तु! क्रीडाङ्गणम् आगच्छतु। अन्ये अपि आगच्छन्ति।',
        npcTranslation: 'Great! Come to the field. Others are coming too.',
        npcAudioPath: '/audio/level2/p2a_npc.mp3',
        backgroundGradient: BG.playground,
        npcSprite: 'friend',
        playerSprite: 'player',
        choices: [
          {
            id: 'p2a1',
            choiceText: 'मम मित्रम् अपि आनयामि।',
            choiceTranslation: 'I will bring my friend too.',
            choiceAudioPath: '/audio/level2/p2a1.mp3',
            nextNodeId: 'END',
          },
          {
            id: 'p2a2',
            choiceText: 'कः खेलं नेष्यति?',
            choiceTranslation: 'Who will lead the game?',
            choiceAudioPath: '/audio/level2/p2a2.mp3',
            nextNodeId: 'END',
          },
        ],
      },
      p2b: {
        id: 'p2b',
        speaker: 'Friend',
        npcText: 'अस्तु, श्वः मेलावः।',
        npcTranslation: "Okay, let's meet tomorrow.",
        npcAudioPath: '/audio/level2/p2b_npc.mp3',
        backgroundGradient: BG.playground,
        npcSprite: 'friend',
        playerSprite: 'player',
        choices: [
          {
            id: 'p2b1',
            choiceText: 'आम्, श्वः निश्चितम् आगच्छामि।',
            choiceTranslation: 'Yes, I will definitely come tomorrow.',
            choiceAudioPath: '/audio/level2/p2b1.mp3',
            nextNodeId: 'END',
          },
          {
            id: 'p2b2',
            choiceText: 'धन्यवादः मित्र।',
            choiceTranslation: 'Thank you, friend.',
            choiceAudioPath: '/audio/level2/p2b2.mp3',
            nextNodeId: 'END',
          },
        ],
      },
    },
  },
  {
    id: 3,
    title: 'Level 3',
    subtitle: 'The Fruit Market',
    icon: 'market',
    accentColor: '#fb923c',
    startNodeId: 'f1',
    nodes: {
      f1: {
        id: 'f1',
        speaker: 'Vendor',
        npcText: 'नमस्ते! अद्य भवान् किं इच्छति?',
        npcTranslation: 'Hello! What would you like today?',
        npcAudioPath: '/audio/level3/f1_npc.mp3',
        backgroundGradient: BG.fruitMarket,
        npcSprite: 'vendor',
        playerSprite: 'customer',
        choices: [
          {
            id: 'f1a',
            choiceText: 'एकं किलोग्रामम् आम्रं यच्छतु।',
            choiceTranslation: 'Give me 1 kg mangoes.',
            choiceAudioPath: '/audio/level3/f1a.mp3',
            nextNodeId: 'f2a',
          },
          {
            id: 'f1b',
            choiceText: 'आम्रस्य मूल्यं किम्?',
            choiceTranslation: 'What is the price of mangoes?',
            choiceAudioPath: '/audio/level3/f1b.mp3',
            nextNodeId: 'f2b',
          },
        ],
      },
      f2a: {
        id: 'f2a',
        speaker: 'Vendor',
        npcText: 'अस्तु, एकं किलोग्रामस्य मूल्यं अशीतिः रूप्यकाणि। किमपि अन्यत्?',
        npcTranslation: 'Okay, that will be 80 rupees. Anything else?',
        npcAudioPath: '/audio/level3/f2a_npc.mp3',
        backgroundGradient: BG.fruitMarket,
        npcSprite: 'vendor',
        playerSprite: 'customer',
        choices: [
          {
            id: 'f2a1',
            choiceText: 'आम्, सेवफलानि अपि योजयतु।',
            choiceTranslation: 'Yes, also add apples.',
            choiceAudioPath: '/audio/level3/f2a1.mp3',
            nextNodeId: 'END',
          },
          {
            id: 'f2a2',
            choiceText: 'न, एतावत् एव। धन्यवादः।',
            choiceTranslation: "No, that's all, thank you.",
            choiceAudioPath: '/audio/level3/f2a2.mp3',
            nextNodeId: 'END',
          },
        ],
      },
      f2b: {
        id: 'f2b',
        speaker: 'Vendor',
        npcText: 'एकं किलोग्रामस्य मूल्यं शतं रूप्यकाणि। बद्धं करोमि किम्?',
        npcTranslation: 'It is 100 rupees per kg. Should I pack it?',
        npcAudioPath: '/audio/level3/f2b_npc.mp3',
        backgroundGradient: BG.fruitMarket,
        npcSprite: 'vendor',
        playerSprite: 'customer',
        choices: [
          {
            id: 'f2b1',
            choiceText: 'आम्, एकं किलोग्रामं बध्नातु।',
            choiceTranslation: 'Yes, pack 1 kg.',
            choiceAudioPath: '/audio/level3/f2b1.mp3',
            nextNodeId: 'f3',
          },
          {
            id: 'f2b2',
            choiceText: 'न, धन्यवादः।',
            choiceTranslation: 'No, thank you.',
            choiceAudioPath: '/audio/level3/f2b2.mp3',
            nextNodeId: 'f3',
          },
        ],
      },
      f3: {
        id: 'f3',
        speaker: 'Vendor',
        npcText: 'इदम्। धन्यवादः!',
        npcTranslation: 'Here you go. Thank you!',
        npcAudioPath: '/audio/level3/f3_npc.mp3',
        backgroundGradient: BG.fruitMarket,
        npcSprite: 'vendor',
        playerSprite: 'customer',
        choices: [],
      },
    },
  },
];
