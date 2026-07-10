export function speakText(text, onEnd = null) {
  if (!window.speechSynthesis) return;

  // Stop anything currently being spoken before starting new speech
  window.speechSynthesis.cancel();

  // Strip markdown styling symbols so the voice reader doesn't stutter or describe them
  const cleanText = text
    .replace(/[*#`_\-]/g, " ")
    .replace(/\[.*?\]\(.*?\)/g, "") // remove markdown links
    .replace(/\s+/g, " ")
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "en-US";
  utterance.rate = 1;

  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}
