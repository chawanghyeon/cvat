import React, { useState } from 'react';
import { Col } from 'antd/lib/grid';
import Icon, { FileDoneOutlined, SwapOutlined } from '@ant-design/icons';
import Modal from 'antd/lib/modal';
import Button from 'antd/lib/button';
import Timeline from 'antd/lib/timeline';
import {
    SaveIcon, UndoIcon, RedoIcon,
} from 'icons';
import { ActiveControl, ToolsBlockerState } from 'reducers';
import CVATTooltip from 'components/common/cvat-tooltip';

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
    toolsBlockerState: ToolsBlockerState;
    activeControl: ActiveControl;
    onSaveAnnotation(): void;
    onCompleteAnnotation(): void;
    onJobUpdate(stage: string): void;
    onJobStateUpdate(state: string): void;
    onUndoClick(): void;
    onRedoClick(): void;
    onFinishDraw(): void;
    onSwitchToolsBlockerState(): void;
}

function LeftGroup(props: Props): JSX.Element {
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
        // drawShortcut,
        // switchToolsBlockerShortcut,
        // activeControl,
        // toolsBlockerState,
        onSaveAnnotation,
        onCompleteAnnotation,
        onJobUpdate,
        onJobStateUpdate,
        onUndoClick,
        onRedoClick,
        // onFinishDraw,
        // onSwitchToolsBlockerState,
    } = props;
    // const includesDoneButton = [
    //     ActiveControl.DRAW_POLYGON,
    //     ActiveControl.DRAW_POLYLINE,
    //     ActiveControl.DRAW_POINTS,
    //     ActiveControl.AI_TOOLS,
    //     ActiveControl.OPENCV_TOOLS,
    // ].includes(activeControl);

    // const includesToolsBlockerButton =
    // [ActiveControl.OPENCV_TOOLS, ActiveControl.AI_TOOLS].includes(activeControl) && toolsBlockerState.buttonVisible;

    // const shouldEnableToolsBlockerOnClick = [ActiveControl.OPENCV_TOOLS].includes(activeControl);
    const [jobStatus, setJobStatus] = useState<string>(anntationStatus);
    const [jobState, setJobState] = useState<string>(anntationState === 'completed' ? 'Reject' : 'Complete');

    const handleStatus = ():void => {
        if (!saving && jobStatus === 'annotation') {
            onJobUpdate('validation');
            setJobStatus('validation');
        }
        if (!saving && jobStatus === 'validation') {
            onJobUpdate('acceptance');
            setJobStatus('acceptance');
        }
        if (!saving && jobStatus === 'acceptance') {
            onJobUpdate('annotation');
            setJobStatus('annotation');
        }
    };

    const handleState = (): void => {
        if (!saving && jobState === 'Complete') {
            setJobState('Reject');
            onJobStateUpdate('completed');
            onCompleteAnnotation();
        }
        if (!saving && jobState !== 'Complete') {
            setJobState('Complete');
            onJobStateUpdate('rejected');
        }
    };

    const handleColor = (): string => {
        if (!saving && jobStatus === 'annotation') return 'red';
        if (!saving && jobStatus === 'validation') return '#ec6126';
        return '#00ca00';
    };

    return (
        <>
            <Modal title='Saving changes on the server' open={saving} footer={[]} closable={false}>
                {/* <Timeline pending={savingStatuses[savingStatuses.length - 1] || 'Pending..'}>
                    {savingStatuses.slice(0, -1).map((status: string, id: number) => (
                        <Timeline.Item key={id}>{status}</Timeline.Item>
                    ))}
                </Timeline> */}
            </Modal>
            <Col className='cvat-annotation-header-left-group'>
                {/* <Dropdown overlay={<AnnotationMenuContainer />}>
                    <Button type='link' className='cvat-annotation-header-button'>
                        <Icon component={MainMenuIcon} />
                        Menu
                    </Button>
                </Dropdown> */}
                <CVATTooltip overlay={`Undo: ${undoAction} ${undoShortcut}`} placement='bottom'>
                    <Button
                        style={{ pointerEvents: undoAction ? 'initial' : 'none', opacity: undoAction ? 1 : 0.5 }}
                        icon={<Icon component={UndoIcon} />}
                        type='text'
                        className='cvat-annotation-header-button'
                        onClick={onUndoClick}
                    />
                </CVATTooltip>
                <CVATTooltip overlay={`Redo: ${redoAction} ${redoShortcut}`} placement='bottom'>
                    <Button
                        style={{ pointerEvents: redoAction ? 'initial' : 'none', opacity: redoAction ? 1 : 0.5 }}
                        icon={<Icon component={RedoIcon} />}
                        type='text'
                        className='cvat-annotation-header-button'
                        onClick={onRedoClick}
                    />
                </CVATTooltip>
                <CVATTooltip overlay={`Save current changes ${saveShortcut}`} placement='bottom'>
                    <Button
                        onClick={saving ? undefined : onSaveAnnotation}
                        icon={<Icon component={SaveIcon} />}
                        type='text'
                        className={
                            saving ?
                                'cvat-annotation-disabled-header-button' :
                                'cvat-annotation-header-button save-button'
                        }
                        style={{ width: '80px' }}
                    >
                        {saving ? 'Saving..' : 'Save'}
                    </Button>
                </CVATTooltip>
                <CVATTooltip overlay='Current Status' placement='bottom'>
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleStatus();
                        }}
                        icon={<SwapOutlined style={{ fontSize: 18 }} />}
                        type='text'
                        className='cvat-annotation-header-button save-button'
                        style={{
                            width: 105,
                            backgroundColor: handleColor(),
                            color: 'white',
                        }}
                    >
                        {jobStatus}
                    </Button>
                </CVATTooltip>
                <CVATTooltip overlay={jobState} placement='bottom'>
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleState();
                        }}
                        icon={<FileDoneOutlined />}
                        type='text'
                        className={`cvat-annotation-header-button save-button ${
                            jobState === 'Complete' ? 'orange' : 'green'
                        }`}
                        style={{ width: '80px' }}
                    >
                        {jobState}
                    </Button>
                </CVATTooltip>
                {/* {includesDoneButton ? (
                    <CVATTooltip overlay={`완료하셨으면 "${drawShortcut}"을 눌러주세요`} placement='bottom'>
                        <Button type='link' className='cvat-annotation-header-button' onClick={onFinishDraw}>
                            <CheckCircleOutlined />
                            완료
                        </Button>
                    </CVATTooltip>
                ) : null} */}
                {/* {includesToolsBlockerButton ? (
                    <CVATTooltip overlay={`요청 연기 후 포인트를 더 생성하려면
                    "${switchToolsBlockerShortcut}"를 누른상태에서 진행해주세요. (활성화 상태 : 파란색)`} placement='bottom'>
                        <Button
                            type='link'
                            className={`cvat-annotation-header-button ${
                                toolsBlockerState.algorithmsLocked ? 'cvat-button-active' : ''
                            }`}
                            onClick={shouldEnableToolsBlockerOnClick ? onSwitchToolsBlockerState : undefined}
                        >
                            <StopOutlined />
                            요청 연기
                        </Button>
                    </CVATTooltip>
                ) : null} */}
            </Col>
        </>
    );
}

export default React.memo(LeftGroup);
