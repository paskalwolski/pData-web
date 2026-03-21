import { useCallback, useState } from "react";

export const useToggle = (initialState: boolean = false) => {
    const [state, setState] = useState(initialState);

    const toggleState = useCallback(() => setState((s) => !s), []);
    return [state, toggleState, setState] as const;
};
