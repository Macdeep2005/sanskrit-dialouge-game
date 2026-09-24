interface CharacterSpriteProps {
  src: string;
  alt?: string;
  flipped?: boolean;
}

export default function CharacterSprite({
  src,
  alt = 'Character',
  flipped = false,
}: CharacterSpriteProps) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className={
        `character-image${
          flipped
            ? ' character-image-flipped'
            : ''
        }`
      }
    />
  );
}