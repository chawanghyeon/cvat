import React, { useState } from 'react';
import { Row, Col } from 'antd/lib/grid';
import { MoreOutlined } from '@ant-design/icons';
import Dropdown from 'antd/lib/dropdown';
import Text from 'antd/lib/typography/Text';
import ObjectButtonsContainer from 'containers/annotation-page/standard-workspace/objects-side-bar/object-buttons';

import { ObjectType, ShapeType, ColorBy } from 'reducers';
import ItemMenu from './object-item-menu';

interface Props {
    jobInstance: any;
    readonly: boolean;
    clientID: number;
    serverID: number | undefined;
    labelID: number;
    labels: any[];
    shapeType: ShapeType;
    objectType: ObjectType;
    color: string;
    colorBy: ColorBy;
    type: string;
    locked: boolean;
    changeColorShortcut: string;
    copyShortcut: string;
    pasteShortcut: string;
    propagateShortcut: string;
    toBackgroundShortcut: string;
    toForegroundShortcut: string;
    removeShortcut: string;
    changeColor(color: string): void;
    changeLabel(label: any): void;
    copy(): void;
    remove(): void;
    propagate(): void;
    createURL(): void;
    switchOrientation(): void;
    toBackground(): void;
    toForeground(): void;
    resetCuboidPerspective(): void;
    edit(): void;
}

function ItemTopComponent(props: Props): JSX.Element {
    const {
        readonly,
        clientID,
        serverID,
        labelID,
        labels,
        shapeType,
        objectType,
        color,
        colorBy,
        type,
        locked,
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
        edit,
        jobInstance,
    } = props;

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

    const selectedLabel = labels.find((label) => label.id === labelID);

    return (
        <>
            <Row align='middle'>
                <Col span={10}>
                    <Text style={{ fontSize: 15, lineHeight: 1.2, color: '#fff' }}>
                        {selectedLabel && selectedLabel.name}
                    </Text>
                    <br />
                    <Text
                        type='secondary'
                        className='cvat-objects-sidebar-state-item-object-type-text'
                    >
                        {type}
                    </Text>
                </Col>
                <Col span={12}>
                    <ObjectButtonsContainer
                        readonly={readonly}
                        clientID={clientID}
                        isTrack={false}
                        isContextMenu={false}
                    />
                </Col>
                <Col span={2}>
                    <Dropdown
                        open={menuVisible}
                        onOpenChange={changeMenuVisible}
                        placement='bottomRight'
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
        </>
    );
}

export default React.memo(ItemTopComponent);
