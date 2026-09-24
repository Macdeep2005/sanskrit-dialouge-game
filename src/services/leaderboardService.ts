import type {
  User,
} from 'firebase/auth';

import {
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from '../firebase-config';

const GAME_ID =
  'sanskritDialogueGame';

const GAME_NAME =
  'Sanskrit Dialogue Game';

const LEADERBOARD_COLLECTION =
  'leaderboard-zatamgame';

export async function postScore(
  currentUser: User,
  finalScore: number
): Promise<boolean> {
  const today =
    new Date()
      .toISOString()
      .split('T')[0];

  const recordId =
    `${currentUser.uid}_${GAME_ID}_${today}`;

  const scoreRef =
    doc(
      db,
      LEADERBOARD_COLLECTION,
      recordId
    );

  const existing =
    await getDoc(scoreRef);

  if (
    existing.exists() &&
    (existing.data().score || 0) >=
      finalScore
  ) {
    return false;
  }

  await setDoc(
    scoreRef,
    {
      userId:
        currentUser.uid,

      playerName:
        currentUser.displayName ||
        'Player',

      email:
        currentUser.email || '',

      photoURL:
        currentUser.photoURL || '',

      gameId:
        GAME_ID,

      gameName:
        GAME_NAME,

      score:
        finalScore,

      scoreDate:
        today,

      updatedAt:
        serverTimestamp(),
    }
  );

  return true;
}