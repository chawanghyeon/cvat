import React from 'react';
import {
    ActiveControl, ToolsBlockerState,
} from 'reducers';
import LeftGroup from './top-bar/left-group';

interface Props {
    anntationStatus: string;
    anntationState: string;
    saving: boolean;
    // savingStatuses: string[];
    undoAction?: string;
    redoAction?: string;
    saveShortcut: string;
    undoShortcut: string;
    redoShortcut: string;
    drawShortcut: string;
    switchToolsBlockerShortcut: string;
    activeControl: ActiveControl;
    toolsBlockerState: ToolsBlockerState;
    onSaveAnnotation(): void;
    onCompleteAnnotation(): void;
    onJobUpdate(stage: string): void;
    onJobStateUpdate(state: string): void;
    onUndoClick(): void;
    onRedoClick(): void;
    onFinishDraw(): void;
    onSwitchToolsBlockerState(): void;
}

export default function AnnotationActionBarComponent(props: Props): JSX.Element {
    const {
        anntationStatus,
        anntationState,
        saving,
        // savingStatuses,
        undoAction,
        redoAction,
        saveShortcut,
        undoShortcut,
        redoShortcut,
        drawShortcut,
        switchToolsBlockerShortcut,
        activeControl,
        toolsBlockerState,
        onSaveAnnotation,
        onCompleteAnnotation,
        onJobUpdate,
        onJobStateUpdate,
        onUndoClick,
        onRedoClick,
        onFinishDraw,
        onSwitchToolsBlockerState,
    } = props;

    return (
        <LeftGroup
            anntationStatus={anntationStatus}
            anntationState={anntationState}
            saving={saving}
            // savingStatuses={savingStatuses}
            undoAction={undoAction}
            redoAction={redoAction}
            saveShortcut={saveShortcut}
            undoShortcut={undoShortcut}
            redoShortcut={redoShortcut}
            activeControl={activeControl}
            drawShortcut={drawShortcut}
            switchToolsBlockerShortcut={switchToolsBlockerShortcut}
            toolsBlockerState={toolsBlockerState}
            onSaveAnnotation={onSaveAnnotation}
            onCompleteAnnotation={onCompleteAnnotation}
            onJobUpdate={onJobUpdate}
            onJobStateUpdate={onJobStateUpdate}
            onUndoClick={onUndoClick}
            onRedoClick={onRedoClick}
            onFinishDraw={onFinishDraw}
            onSwitchToolsBlockerState={onSwitchToolsBlockerState}
        />
    );
}
