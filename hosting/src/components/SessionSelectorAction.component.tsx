import React, { useState } from "react";
import { TbWindowMinimize, TbTrashXFilled } from "react-icons/tb";
import { MdCancel } from "react-icons/md";

const SessionSelectorActions = ({ sessionId, trimAction, deleteAction }) => {
    const [isActioned, setIsActioned] = useState(null);
    const [preparedAction, setPreparedAction] = useState(null);

    const handleTrim = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isActioned == "trim") {
            trimAction(sessionId);
        } else {
            setIsActioned("trim");
        }
    };
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isActioned == "delete") {
            deleteAction(sessionId);
        } else {
            setIsActioned("delete");
        }
    };

    const cancelAction = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsActioned(null);
    };

    return (
        <div
            className="sessionDetail"
            style={{
                marginRight: "0.4em",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}
            onMouseLeave={() => {
                setIsActioned(null);
            }}
        >
            {isActioned !== null && (
                <div style={{ fontSize: "0.6em" }}>Confirm {isActioned}?</div>
            )}
            {isActioned !== null && (
                <button className="icon cancelAction" onClick={cancelAction}>
                    <MdCancel />
                </button>
            )}
            {(isActioned == "trim" || isActioned == null) && (
                <button
                    className="icon destroyAction"
                    title={"Trim Slower Laps"}
                    onClick={handleTrim}
                >
                    <TbWindowMinimize />
                </button>
            )}
            {(isActioned == "delete" || isActioned == null) && (
                <button
                    className="icon destroyAction"
                    title="Delete Session"
                    onClick={handleDelete}
                >
                    <TbTrashXFilled />
                </button>
            )}
        </div>
    );
};

export default SessionSelectorActions;
