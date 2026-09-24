export async function transliterateNameToDevanagari(
  name: string
): Promise<string> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error('Please enter your name.');
  }

  const url =
    'https://inputtools.google.com/request' +
    `?text=${encodeURIComponent(trimmedName)}` +
    '&itc=hi-t-i0-und' +
    '&num=1' +
    '&cp=0' +
    '&cs=1' +
    '&ie=utf-8' +
    '&oe=utf-8' +
    '&app=sanskrit-dialogue-game';

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Could not transliterate the name.');
  }

  const data = await response.json();

  if (
    !Array.isArray(data) ||
    data[0] !== 'SUCCESS' ||
    !data[1]?.[0]?.[1]?.[0]
  ) {
    throw new Error('No transliteration was found.');
  }

  return data[1][0][1][0];
}