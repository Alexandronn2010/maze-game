export const STATE = {
  EXPLORING: 'exploring',
  DIALOGUE: 'dialogue',
  PAUSED: 'paused',
  WIN: 'win',
};

export function createState() {
  return {
    current: STATE.EXPLORING,
    activeNPC: null,
  };
}
