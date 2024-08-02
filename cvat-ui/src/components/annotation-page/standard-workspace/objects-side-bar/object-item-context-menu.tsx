import React, {
    useCallback, useState,
} from 'react';
import Text from 'antd/lib/typography/Text';

import ObjectButtonsContainer from 'containers/annotation-page/standard-workspace/objects-side-bar/object-buttons';
import { ObjectType, ShapeType, ColorBy } from 'reducers';
import { Col, Dropdown, Row } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import LabelSelector from 'components/label-selector/label-selector';
import ItemMenu from './object-item-menu';

interface Props {
    normalizedKeyMap: Record<string, string>;
    readonly: boolean;
    activated: boolean;
    objectType: ObjectType;
    shapeType: ShapeType;
    clientID: number;
    serverID: number | undefined;
    labelID: number;
    locked: boolean;
    elements: any[];
    color: string;
    colorBy: ColorBy;
    labels: any[];
    attributes: any[];
    jobInstance: any;
    activate(activeElementID?: number): void;
    copy(): void;
    propagate(): void;
    createURL(): void;
    switchOrientation(): void;
    toBackground(): void;
    toForeground(): void;
    remove(): void;
    changeLabel(label: any): void;
    changeColor(color: string): void;
    resetCuboidPerspective(): void;
    edit(): void;
}

function ObjectItemContextMenuComponent(props: Props): JSX.Element {
    const {
        activated,
        readonly,
        objectType,
        shapeType,
        clientID,
        serverID,
        locked,
        labelID,
        color,
        colorBy,
        labels,
        normalizedKeyMap,
        activate,
        copy,
        propagate,
        createURL,
        switchOrientation,
        toBackground,
        toForeground,
        remove,
        changeLabel,
        changeColor,
        resetCuboidPerspective,
        edit,
        jobInstance,
    } = props;

    const type =
        objectType === ObjectType.TAG ?
            ObjectType.TAG.toUpperCase() :
            `${shapeType.toUpperCase()} ${objectType.toUpperCase()}`;

    const copyShortcut = normalizedKeyMap.COPY_SHAPE;
    const pasteShortcut = normalizedKeyMap.PASTE_SHAPE;
    const propagateShortcut = normalizedKeyMap.PROPAGATE_OBJECT;
    const toBackgroundShortcut = normalizedKeyMap.TO_BACKGROUND;
    const toForegroundShortcut = normalizedKeyMap.TO_FOREGROUND;
    const removeShortcut = normalizedKeyMap.DELETE_OBJECT;
    const changeColorShortcut = normalizedKeyMap.CHANGE_OBJECT_COLOR;

    const className = !activated ?
        'cvat-objects-sidebar-state-item' :
        'cvat-objects-sidebar-state-item cvat-objects-sidebar-state-active-item';

    const activateState = useCallback(() => {
        activate();
    }, []);

    const [menuVisible, setMenuVisible] = useState(false);
    const [colorPickerVisible, setColorPickerVisible] = useState(false);

    const changeMenuVisible = (visible: boolean): void => {
        if (!visible && colorPickerVisible) return;
        setMenuVisible(visible);
    };

    const changeColorPickerVisible = (visible: boolean): void => {
        if (!visible) {
            setMenuVisible(false);
        }
        setColorPickerVisible(visible);
    };

    return (
        <div
            onMouseEnter={activateState}
            id={`cvat-objects-sidebar-state-item-${clientID}`}
            className={className}
        >
            <Row>
                <Col span={22}>
                    <Text
                        type='secondary'
                        className='cvat-objects-sidebar-state-item-object-type-text'
                    >
                        {type}
                    </Text>
                </Col>
                <Col span={2}>
                    <Dropdown
                        open={menuVisible}
                        onOpenChange={changeMenuVisible}
                        placement='bottomLeft'
                        dropdownRender={() => ItemMenu({
                            jobInstance,
                            readonly,
                            serverID,
                            locked,
                            shapeType,
                            objectType,
                            color,
                            colorBy,
                            colorPickerVisible,
                            changeColorShortcut,
                            copyShortcut,
                            pasteShortcut,
                            propagateShortcut,
                            toBackgroundShortcut,
                            toForegroundShortcut,
                            removeShortcut,
                            changeColor,
                            copy,
                            remove,
                            propagate,
                            createURL,
                            switchOrientation,
                            toBackground,
                            toForeground,
                            resetCuboidPerspective,
                            changeColorPickerVisible,
                            edit,
                        })}
                    >
                        <MoreOutlined />
                    </Dropdown>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <LabelSelector
                        disabled={readonly || shapeType === ShapeType.SKELETON}
                        labels={labels}
                        value={labelID}
                        onChange={changeLabel}
                        className='cvat-objects-sidebar-state-item-label-selector'
                    />
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <ObjectButtonsContainer
                        readonly={readonly}
                        clientID={clientID}
                        isTrack={false}
                        isContextMenu
                    />
                </Col>
            </Row>
        </div>

    );
}

export default React.memo(ObjectItemContextMenuComponent);
