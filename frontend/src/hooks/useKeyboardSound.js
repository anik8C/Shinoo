const keyStrokeSounds = [
    new Audio('/sounds/keystroke1.mp3'),
    new Audio('/sounds/keystroke2.mp3'),
    new Audio('/sounds/keystroke3.mp3'),
    new Audio('/sounds/keystroke4.mp3')
];

function useKeyboardSound() {
    const playKeyStrokeSound = () => {
        const randomSound = keyStrokeSounds[Math.floor(Math.random() * keyStrokeSounds.length)];
        randomSound.currentTime = 0; // This is for better UX, to ensure the sound plays from the start each time

        randomSound.play().catch((error) => console.error('Error playing sound:', error));
    };

    return { playKeyStrokeSound }
}

export default useKeyboardSound;