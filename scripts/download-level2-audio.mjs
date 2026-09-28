import { mkdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const API_URL = "https://yourvoic.com/api/v1/tts/generate";
const apiKey = process.env.YOURVOIC_API_KEY;
const sanskritVoice = process.env.YOURVOIC_VOICE || "Deepti";
const englishVoice = process.env.YOURVOIC_ENGLISH_VOICE || "Kylie";
const model = process.env.YOURVOIC_MODEL || "aura-lite";
const projectRoot = process.cwd();
const publicRoot = path.join(projectRoot, "public");
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const variableAudioTemplates = {
  "/audio/intro/i2a.mp3": "मम नाम… अस्ति।",
  "/audio/intro/i2b.mp3": "अहं नाम… गच्छामि।",
};

const levels = JSON.parse(
  await readFile(path.join(projectRoot, "src", "data", "levels.json"), "utf8"),
);

const clips = [];
for (const level of levels) {
  for (const node of Object.values(level.nodes)) {
    if (node.npcAudioPath && !/[{][^}]+[}]/.test(node.npcText)) {
      clips.push({ path: node.npcAudioPath, text: node.npcText });
    }
    for (const choice of node.choices || []) {
      const templateText = variableAudioTemplates[choice.choiceAudioPath];
      if (choice.choiceAudioPath && (!/[{][^}]+[}]/.test(choice.choiceText) || templateText)) {
        clips.push({ path: choice.choiceAudioPath, text: templateText || choice.choiceText });
      }
    }
  }
}

const uniqueClips = [...new Map(clips.map((clip) => [clip.path, clip])).values()];

if (!apiKey || apiKey === "paste_your_key_here") {
  throw new Error("YOURVOIC_API_KEY is missing. Add it to .env.local first.");
}

async function cleanUpPartialDownloads() {
  for (const clip of uniqueClips) {
    await unlink(path.join(publicRoot, clip.path.replace(/^\/+/, "")) + ".part").catch(
      () => {},
    );
  }
}

try {
  for (const clip of uniqueClips) {
    const relativePath = clip.path.replace(/^\/+/, "");
    const destination = path.join(publicRoot, relativePath);
    const temporaryDestination = `${destination}.part`;
    await mkdir(path.dirname(destination), { recursive: true });

    try {
      const existing = await stat(destination);
      if (existing.size > 0) {
        console.log(`Skipping existing clip: ${clip.path}`);
        continue;
      }
    } catch {
      // The clip does not exist yet, so generate it below.
    }

    const isSanskrit = /[\u0900-\u097f]/u.test(clip.text);
    console.log(`Generating ${clip.path}...`);

    let response;
    while (true) {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: clip.text,
          voice: isSanskrit ? sanskritVoice : englishVoice,
          language: isSanskrit ? "sa-IN" : "en-US",
          model,
          speed: 1,
          pitch: 1,
          format: "mp3",
        }),
      });

      if (response.status !== 429) break;
      const retryAfter = Number(response.headers.get("retry-after")) || 60;
      console.log(`Rate limit reached; retrying ${clip.path} in ${retryAfter} seconds...`);
      const retryDetails = (await response.text()).slice(0, 300);
      if (retryDetails) console.log(`YourVoic rate-limit detail: ${retryDetails}`);
      await sleep((retryAfter + 5) * 1000);
    }

    if (!response.ok) {
      const details = (await response.text()).slice(0, 500);
      throw new Error(
        `YourVoic rejected ${clip.path} (${response.status} ${response.statusText}): ${details}`,
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("audio/")) {
      const details = (await response.text()).slice(0, 500);
      throw new Error(`YourVoic returned ${contentType} for ${clip.path}: ${details}`);
    }

    const audio = Buffer.from(await response.arrayBuffer());
    if (audio.length === 0) throw new Error(`Empty audio returned for ${clip.path}.`);

    await writeFile(temporaryDestination, audio);
    await rename(temporaryDestination, destination);
    console.log(`Saved ${clip.path} (${audio.length} bytes)`);
  }

  console.log(`Audio ready for ${uniqueClips.length} static dialogue lines.`);
} catch (error) {
  await cleanUpPartialDownloads();
  throw error;
}
