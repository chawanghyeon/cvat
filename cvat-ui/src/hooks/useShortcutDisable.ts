import { useEffect, useState } from 'react';

const useShortcutDisable = (disabledKeys: string[], type = ''): boolean => {
    const [isDisabled, setIsDisabled] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (disabledKeys.includes(event.key)) {
                event.preventDefault();
                setIsDisabled(true);
            }
        };

        const handleAllKeyDown = (event: KeyboardEvent) => {
            event.preventDefault();
            setIsDisabled(true);
        };

        const handleKeyUp = () => {
            setIsDisabled(false);
        };

        window.addEventListener('keydown', type === 'all' ? handleAllKeyDown : handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', type === 'all' ? handleAllKeyDown : handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [disabledKeys]);

    return isDisabled;
};

export default useShortcutDisable;
