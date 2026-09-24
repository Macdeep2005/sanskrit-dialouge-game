import {
  useState,
} from 'react';

import type {
  User,
} from 'firebase/auth';

import {
  postScore,
} from '../services/leaderboardService';

export function useLeaderboard(
  user: User | null | undefined,
  score: number
) {
  const [
    leaderboardMessage,
    setLeaderboardMessage,
  ] = useState('');

  const [
    submittingScore,
    setSubmittingScore,
  ] = useState(false);

async function submitLeaderboardScore(
  finalScore?: number
) {
  if (!user) {
    setLeaderboardMessage(
      'You must be signed in to Zat.am.'
    );

    return;
  }

  const scoreToSubmit =
    finalScore ?? score;

  setSubmittingScore(true);
  setLeaderboardMessage('');

  try {
    const updated =
      await postScore(
        user,
        scoreToSubmit
      );

    setLeaderboardMessage(
      updated
        ? 'Score submitted to leaderboard!'
        : 'Your existing score is already higher.'
    );
  } catch (error) {
    console.error(
      'Leaderboard error:',
      error
    );

    setLeaderboardMessage(
      'Could not submit score.'
    );
  } finally {
    setSubmittingScore(false);
  }
}

  return {
    leaderboardMessage,
    submittingScore,
    submitLeaderboardScore,
  };
}