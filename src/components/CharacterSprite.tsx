interface CharacterSpriteProps {
  type: string;
  flipped?: boolean;
}

const CHARACTER_IMAGES: Record<string, string> = {
  teacher: '/characters/teacher.png',
  student: '/characters/student.png',
  friend: '/characters/friend.png',
  player: '/characters/player.png',
  vendor: '/characters/vendor.png',
  customer: '/characters/customer.png',
};

export default function CharacterSprite({ type, flipped = false }: CharacterSpriteProps) {
  const src = CHARACTER_IMAGES[type] ?? CHARACTER_IMAGES.player;
  return <img src={src} alt={type} draggable={false} className={`character-image${flipped ? ' character-image-flipped' : ''}`} />;
}
