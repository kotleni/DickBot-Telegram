import {DicksGame} from './dicks-game';

const dicksGame = new DicksGame();
dicksGame
  .start()
  .then(() => void console.log('Bot started'))
  .catch(err => {
    console.error(err);
  });
