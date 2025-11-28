import nspell from 'nspell';
import frDictionary from 'dictionary-fr';

console.log('Imports successful');

try {
    const spell = nspell(frDictionary);
    console.log('Spell checker created');
    console.log('Test "bonjour":', spell.correct('bonjour'));
    console.log('Test "bnojour":', spell.correct('bnojour'));
} catch (e) {
    console.error('Error creating nspell:', e);
}
