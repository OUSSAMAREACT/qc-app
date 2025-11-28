import nspell from 'nspell';
import frDictionary from 'dictionary-fr';

const spell = nspell(frDictionary);

const words = ["iniative", "initiative", "bonjour", "bnojour"];

words.forEach(w => {
    console.log(`${w}: ${spell.correct(w)}`);
});
