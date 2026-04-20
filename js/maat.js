// maat.js — The 42 Declarations of Innocence (Negative Confessions)
// Source: Papyrus of Ani, Egyptian Book of the Dead
// MAAT · Meridian Axiom Alignment Technologies

export const NEGATIVE_CONFESSIONS = [
    "I have not committed sin.",
    "I have not committed robbery with violence.",
    "I have not stolen.",
    "I have not slain men and women.",
    "I have not stolen grain.",
    "I have not purloined offerings.",
    "I have not stolen the property of the gods.",
    "I have not uttered lies.",
    "I have not carried away food.",
    "I have not uttered curses.",
    "I have not committed adultery.",
    "I have not lain with men.",
    "I have made none to weep.",
    "I have not eaten the heart.",
    "I have not attacked any man.",
    "I am not a man of deceit.",
    "I have not stolen cultivated land.",
    "I have not been an eavesdropper.",
    "I have slandered no man.",
    "I have not been angry without just cause.",
    "I have not debauched the wife of any man.",
    "I have not polluted myself.",
    "I have terrorized none.",
    "I have not transgressed the law.",
    "I have not been wroth.",
    "I have not shut my ears to the words of truth.",
    "I have not blasphemed.",
    "I am not a man of violence.",
    "I have not been a stirrer up of strife.",
    "I have not acted with undue haste.",
    "I have not pried into matters.",
    "I have not multiplied my words in speaking.",
    "I have wronged none, I have done no evil.",
    "I have not worked witchcraft against the king.",
    "I have never stopped the flow of water.",
    "I have never raised my voice.",
    "I have not cursed God.",
    "I have not acted with arrogance.",
    "I have not stolen the bread of the gods.",
    "I have not carried away the khenfu cakes from the spirits of the dead.",
    "I have not snatched away the bread of the child.",
    "I have not slain the cattle belonging to the god."
];

export function getRandomConfession() {
    const index = Math.floor(Math.random() * NEGATIVE_CONFESSIONS.length);
    return {
        text: NEGATIVE_CONFESSIONS[index],
        index: index + 1
    };
}
