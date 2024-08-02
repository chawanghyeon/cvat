import React from 'react';
import { Row, Col } from 'antd/lib/grid';
import Icon from '@ant-design/icons';

import CVATTooltip from 'components/common/cvat-tooltip';
import { ObjectType, ShapeType } from 'reducers';
import {
    FirstIcon,
    LastIcon,
    PreviousIcon,
    NextIcon,
    LockIcon,
    UnlockIcon,
    StrokeIcon,
    NonStrokeIcon,
    PinIcon,
    UnpinIcon,
    EyeIcon,
    EyeOffIcon,
    TrackIcon,
    TrackActiveIcon,
    StarFillIcon,
    StarIcon,
    TrashIcon,
} from 'icons';

interface Props {
    readonly: boolean;
    parentID: number;
    objectType: ObjectType;
    shapeType: ShapeType;
    occluded: boolean;
    outside: boolean | undefined;
    locked: boolean;
    pinned: boolean;
    hidden: boolean;
    keyframe: boolean | undefined;
    isContextMenu: boolean;
    outsideDisabled: boolean;
    hiddenDisabled: boolean;
    keyframeDisabled: boolean;
    switchOccludedShortcut: string;
    switchOutsideShortcut: string;
    switchLockShortcut: string;
    switchHiddenShortcut: string;
    switchKeyFrameShortcut: string;
    nextKeyFrameShortcut: string;
    prevKeyFrameShortcut: string;

    navigateFirstKeyframe: null | (() => void);
    navigatePrevKeyframe: null | (() => void);
    navigateNextKeyframe: null | (() => void);
    navigateLastKeyframe: null | (() => void);

    setOccluded(): void;
    unsetOccluded(): void;
    setOutside(): void;
    unsetOutside(): void;
    setKeyframe(): void;
    unsetKeyframe(): void;
    lock(): void;
    unlock(): void;
    pin(): void;
    unpin(): void;
    hide(): void;
    show(): void;
    remove(): void;
}

const classes = {
    firstKeyFrame: { className: 'cvat-object-item-button-first-keyframe' },
    prevKeyFrame: { className: 'cvat-object-item-button-prev-keyframe' },
    nextKeyFrame: { className: 'cvat-object-item-button-next-keyframe' },
    lastKeyFrame: { className: 'cvat-object-item-button-last-keyframe' },
    outside: {
        enabled: { className: 'cvat-object-item-button-outside cvat-object-item-button-outside-enabled' },
        disabled: { className: 'cvat-object-item-button-outside' },
    },
    lock: {
        enabled: { className: 'cvat-object-item-button-lock cvat-object-item-button-lock-enabled' },
        disabled: { className: 'cvat-object-item-button-lock' },
    },
    occluded: {
        enabled: { className: 'cvat-object-item-button-occluded cvat-object-item-button-occluded-enabled' },
        disabled: { className: 'cvat-object-item-button-occluded' },
    },
    pinned: {
        enabled: { className: 'cvat-object-item-button-pinned cvat-object-item-button-pinned-enabled' },
        disabled: { className: 'cvat-object-item-button-pinned' },
    },
    hidden: {
        enabled: { className: 'cvat-object-item-button-hidden cvat-object-item-button-hidden-enabled' },
        disabled: { className: 'cvat-object-item-button-hidden' },
    },
    keyframe: {
        enabled: { className: 'cvat-object-item-button-keyframe cvat-object-item-button-keyframe-enabled' },
        disabled: { className: 'cvat-object-item-button-keyframe' },
    },
};

function NavigateFirstKeyframe(props: Props): JSX.Element {
    const { navigateFirstKeyframe } = props;
    return navigateFirstKeyframe ? (
        <Icon {...classes.firstKeyFrame} component={FirstIcon} onClick={navigateFirstKeyframe} />
    ) : (
        <Icon {...classes.firstKeyFrame} component={FirstIcon} style={{ opacity: 0.5, pointerEvents: 'none' }} />
    );
}

function NavigatePrevKeyframe(props: Props): JSX.Element {
    const { prevKeyFrameShortcut, navigatePrevKeyframe } = props;
    return navigatePrevKeyframe ? (
        <CVATTooltip title={`이전 프레임으로 이동 ${prevKeyFrameShortcut}`}>
            <Icon {...classes.prevKeyFrame} component={PreviousIcon} onClick={navigatePrevKeyframe} />
        </CVATTooltip>
    ) : (
        <Icon {...classes.prevKeyFrame} component={PreviousIcon} style={{ opacity: 0.5, pointerEvents: 'none' }} />
    );
}

function NavigateNextKeyframe(props: Props): JSX.Element {
    const { navigateNextKeyframe, nextKeyFrameShortcut } = props;
    return navigateNextKeyframe ? (
        <CVATTooltip title={`다음 프레임으로 이동 ${nextKeyFrameShortcut}`}>
            <Icon {...classes.nextKeyFrame} component={NextIcon} onClick={navigateNextKeyframe} />
        </CVATTooltip>
    ) : (
        <Icon {...classes.nextKeyFrame} component={NextIcon} style={{ opacity: 0.5, pointerEvents: 'none' }} />
    );
}

function NavigateLastKeyframe(props: Props): JSX.Element {
    const { navigateLastKeyframe } = props;
    return navigateLastKeyframe ? (
        <Icon {...classes.lastKeyFrame} component={LastIcon} onClick={navigateLastKeyframe} />
    ) : (
        <Icon {...classes.lastKeyFrame} component={LastIcon} style={{ opacity: 0.5, pointerEvents: 'none' }} />
    );
}

function SwitchLock(props: Props): JSX.Element {
    const {
        locked, switchLockShortcut, lock, unlock,
    } = props;
    return (
        <CVATTooltip title={`Lock ${switchLockShortcut}`}>
            {locked ? (
                <Icon {...classes.lock.enabled} component={LockIcon} onClick={unlock} />
            ) : (
                <Icon {...classes.lock.disabled} component={UnlockIcon} onClick={lock} />
            )}
        </CVATTooltip>
    );
}

function SwitchOccluded(props: Props): JSX.Element {
    const {
        switchOccludedShortcut, occluded, unsetOccluded, setOccluded,
    } = props;
    return (
        <CVATTooltip title={`Occluded ${switchOccludedShortcut}`}>
            {occluded ? (
                <Icon {...classes.occluded.enabled} component={NonStrokeIcon} onClick={unsetOccluded} />
            ) : (
                <Icon {...classes.occluded.disabled} component={StrokeIcon} onClick={setOccluded} />
            )}
        </CVATTooltip>
    );
}

function SwitchPinned(props: Props): JSX.Element {
    const { pinned, pin, unpin } = props;
    return (
        <CVATTooltip title='Pinned'>
            {pinned ? (
                <Icon {...classes.pinned.enabled} component={PinIcon} onClick={unpin} />
            ) : (
                <Icon {...classes.pinned.disabled} component={UnpinIcon} onClick={pin} />
            )}
        </CVATTooltip>
    );
}

function SwitchHidden(props: Props): JSX.Element {
    const {
        switchHiddenShortcut, hidden, hiddenDisabled, show, hide,
    } = props;
    const hiddenStyle = hiddenDisabled ? { opacity: 0.5, pointerEvents: 'none' as const } : {};
    return (
        <CVATTooltip title={`Hidden ${switchHiddenShortcut}`}>
            {hidden ? (
                <Icon {...classes.hidden.enabled} component={EyeOffIcon} onClick={show} style={hiddenStyle} />
            ) : (
                <Icon {...classes.hidden.disabled} component={EyeIcon} onClick={hide} style={hiddenStyle} />
            )}
        </CVATTooltip>
    );
}

function SwitchOutside(props: Props): JSX.Element {
    const {
        outside, switchOutsideShortcut, outsideDisabled, unsetOutside, setOutside,
    } = props;
    const outsideStyle = outsideDisabled ? { opacity: 0.5, pointerEvents: 'none' as const } : {};
    return (
        <CVATTooltip title={`Track outside ${switchOutsideShortcut}`}>
            {outside ? (
                <Icon
                    {...classes.outside.enabled}
                    component={TrackActiveIcon}
                    onClick={unsetOutside}
                    style={outsideStyle}
                />
            ) : (
                <Icon {...classes.outside.disabled} component={TrackIcon} onClick={setOutside} style={outsideStyle} />
            )}
        </CVATTooltip>
    );
}

function SwitchKeyframe(props: Props): JSX.Element {
    const {
        keyframe, switchKeyFrameShortcut, keyframeDisabled, unsetKeyframe, setKeyframe,
    } = props;
    const keyframeStyle = keyframeDisabled ? { opacity: 0.5, pointerEvents: 'none' as const } : {};
    return (
        <CVATTooltip title={`Keyframe ${switchKeyFrameShortcut}`}>
            {keyframe ? (
                <Icon
                    {...classes.keyframe.enabled}
                    component={StarFillIcon}
                    onClick={unsetKeyframe}
                    style={keyframeStyle}
                />
            ) : (
                <Icon {...classes.keyframe.disabled} component={StarIcon} onClick={setKeyframe} style={keyframeStyle} />
            )}
        </CVATTooltip>
    );
}

function RemoveItem(props: Props): JSX.Element {
    const {
        remove,
    } = props;
    return (
        <CVATTooltip title='remove'>
            <Icon component={TrashIcon} onClick={remove} className='remove-btn' />
        </CVATTooltip>
    );
}

function ItemButtonsComponent(props: Props): JSX.Element {
    const {
        readonly, objectType, shapeType, parentID, isContextMenu,
    } = props;

    if (readonly) {
        return (
            <Row align='middle' justify='end' className='cvat-objects-button'>
                <Col span={5} style={{ textAlign: 'center' }}>
                    <SwitchHidden {...props} />
                </Col>
            </Row>
        );
    }

    if (objectType === ObjectType.TAG) {
        return (
            <Row align='middle' justify='space-around'>
                <Col span={24} style={{ textAlign: 'center' }}>
                    <Row justify='space-around'>
                        <Col>
                            <SwitchLock {...props} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }

    return (
        <Row align='middle' justify='space-around' className='cvat-objects-button'>
            <Col span={24} style={{ textAlign: 'center' }}>
                <Row style={{ justifyContent: 'space-evenly' }}>
                    { Number.isInteger(parentID) && (
                        <Col>
                            <SwitchOutside {...props} />
                        </Col>
                    )}
                    <Col>
                        <SwitchLock {...props} />
                    </Col>
                    <Col>
                        <SwitchOccluded {...props} />
                    </Col>
                    <Col>
                        <SwitchHidden {...props} />
                    </Col>
                    {shapeType !== ShapeType.POINTS && (
                        <Col>
                            <SwitchPinned {...props} />
                        </Col>
                    )}
                    {isContextMenu && (
                        <Col>
                            <RemoveItem {...props} />
                        </Col>
                    )}
                </Row>
            </Col>
        </Row>
    );
}

function ItemButtonsTrack(props: Props): JSX.Element {
    const {
        readonly,
    } = props;

    return (
        <Row align='middle' justify='space-around' className='cvat-item-buttons-track'>
            <Col span={24} style={{ textAlign: 'center' }}>
                <Row justify='space-around'>
                    {!readonly && (
                        <>
                            <Col>
                                <SwitchOutside {...props} />
                            </Col>
                            <Col>
                                <SwitchKeyframe {...props} />
                            </Col>
                        </>
                    )}
                    <Col>
                        <NavigateFirstKeyframe {...props} />
                    </Col>
                    <Col>
                        <NavigatePrevKeyframe {...props} />
                    </Col>
                    <Col>
                        <NavigateNextKeyframe {...props} />
                    </Col>
                    <Col>
                        <NavigateLastKeyframe {...props} />
                    </Col>
                </Row>
            </Col>
        </Row>
    );
}
const ItemButtonsTrackComponent = React.memo(ItemButtonsTrack);

export default React.memo(ItemButtonsComponent);
export { ItemButtonsTrackComponent };
