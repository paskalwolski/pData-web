import { useState } from "react";

const useOpeneable = (initialState: boolean = false) => {
    const [isOpen, setOpen] = useState(initialState);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const toggleOpen = () => setOpen((currentIsOpen) => !currentIsOpen);

    return { isOpen, toggleOpen, handleOpen, handleClose, setOpen } as const;
};

export { useOpeneable };
