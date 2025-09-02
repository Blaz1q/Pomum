export class Audio{
/**
 * Play a sound with adjustable pitch
 * @param {string} url - Path to audio file
 * @param {number} pitch - Playback rate (1 = normal, 2 = one octave up, 0.5 = one octave down)
 */
static async playSound(url, pitch = 1) {
  const buffer = await loadSound(url);
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = pitch; // changes pitch
  source.connect(audioContext.destination);
  source.start();
}
}
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundBufferCache = {};
async function loadSound(url) {
  if (soundBufferCache[url]) return soundBufferCache[url];
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  soundBufferCache[url] = audioBuffer;
  return audioBuffer;
}