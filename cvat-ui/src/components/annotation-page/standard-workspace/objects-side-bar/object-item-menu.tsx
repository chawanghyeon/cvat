import React, { useEffect } from 'react';
import Menu from 'antd/lib/menu';
import Button from 'antd/lib/button';
import Icon, { EditOutlined } from '@ant-design/icons';

import {
    ResetPerspectiveIcon, ColorizeIcon, CopyIcon, TrashGrayIcon, RotateIcon,
} from 'icons';
import CVATTooltip from 'components/common/cvat-tooltip';
import { ObjectType, ShapeType, ColorBy } from 'reducers';
import { DimensionType } from 'cvat-core-wrapper';

import ColorPicker from './color-picker';

interface Props {
    readonly: boolean;
    serverID: number | undefined;
    locked: boolean;
    shapeType: ShapeType;
    objectType: ObjectType;
    color: string;
    colorBy: ColorBy;
    colorPickerVisible: boolean;
    changeColorShortcut: string;
    copyShortcut: string;
    pasteShortcut: string;
    propagateShortcut: string;
    toBackgroundShortcut: string;
    toForegroundShortcut: string;
    removeShortcut: string;
    changeColor(value: string): void;
    copy(): void;
    remove(): void;
    propagate(): void;
    createURL(): void;
    switchOrientation(): void;
    toBackground(): void;
    toForeground(): void;
    resetCuboidPerspective(): void;
    changeColorPickerVisible(visible: boolean): void;
    edit(): void;
    jobInstance: any;
}

interface ItemProps {
    toolProps: Props;
}

function MakeCopyItem(props: ItemProps): JSX.Element {
    const { toolProps, ...rest } = props;
    const { copyShortcut, pasteShortcut, copy } = toolProps;
    return (
        <Menu.Item {...rest}>
            <CVATTooltip title={`${copyShortcut} and ${pasteShortcut}`}>
                <Button
                    className='cvat-object-item-menu-make-copy'
                    type='link'
                    icon={<Icon component={CopyIcon} />}
                    onClick={copy}
                >
                    Make a copy
                </Button>
            </CVATTooltip>
        </Menu.Item>
    );
}

function EditMaskItem(props: ItemProps): JSX.Element {
    const { toolProps, ...rest } = props;
    const { edit } = toolProps;
    return (
        <Menu.Item {...rest}>
            <CVATTooltip title='Shift + Double click'>
                <Button
                    className='cvat-object-item-menu-edit-object'
                    type='link'
                    icon={<EditOutlined />}
                    onClick={edit}
                >
                    Edit
                </Button>
            </CVATTooltip>
        </Menu.Item>
    );
}

function PropagateItem(props: ItemProps): JSX.Element {
    const { toolProps, ...rest } = props;
    const { propagateShortcut, propagate } = toolProps;
    return (
        <Menu.Item {...rest}>
            <CVATTooltip title={`${propagateShortcut}`}>
                <Button
                    className='cvat-object-item-menu-propagate-item'
                    type='link'
                    icon={<Icon component={CopyIcon} />}
                    onClick={propagate}
                >
                    Propagation
                </Button>
            </CVATTooltip>
        </Menu.Item>
    );
}

function SwitchOrientationItem(props: ItemProps): JSX.Element {
    const { toolProps, ...rest } = props;
    const { switchOrientation } = toolProps;
    return (
        <Menu.Item {...rest}>
            <Button
                className='cvat-object-item-menu-switch-orientation'
                type='link'
                icon={<Icon component={RotateIcon} />}
                onClick={switchOrientation}
            >
                Switch orientation
            </Button>
        </Menu.Item>
    );
}

function ResetPerspectiveItem(props: ItemProps): JSX.Element {
    const { toolProps, ...rest } = props;
    const { resetCuboidPerspective } = toolProps;
    return (
        <Menu.Item {...rest}>
            <Button
                className='cvat-object-item-menu-reset-perspective'
                type='link'
                onClick={resetCuboidPerspective}
            >
                <Icon component={ResetPerspectiveIcon} />
                Reset perspective
            </Button>
        </Menu.Item>
    );
}

function SwitchColorItem(props: ItemProps): JSX.Element {
    const { toolProps, ...rest } = props;
    const {
        color,
        colorPickerVisible,
        changeColorShortcut,
        colorBy,
        changeColor,
        changeColorPickerVisible,
    } = toolProps;
    return (
        <Menu.Item {...rest}>
            <CVATTooltip title={`${changeColorShortcut}`}>
                <Button type='link' onClick={() => changeColorPickerVisible(!colorPickerVisible)}>
                    <Icon component={ColorizeIcon} />
                    {`change ${colorBy.toLowerCase()} color`}
                </Button>
            </CVATTooltip>
            <ColorPicker
                value={color}
                onChange={changeColor}
                visible={colorPickerVisible}
                onVisibleChange={changeColorPickerVisible}
                resetVisible={false}
            />
        </Menu.Item>
    );
}

function RemoveItem(props: ItemProps): JSX.Element {
    const { toolProps, ...rest } = props;
    const { removeShortcut, remove } = toolProps;
    return (
        <Menu.Item {...rest}>
            <CVATTooltip title={`${removeShortcut}`}>
                <Button
                    type='link'
                    icon={<Icon component={TrashGrayIcon} />}
                    onClick={remove}
                    className='cvat-object-item-menu-remove-object'
                >
                    Remove
                </Button>
            </CVATTooltip>
        </Menu.Item>
    );
}

export default function ItemMenu(props: Props): JSX.Element {
    const {
        readonly, shapeType, objectType, colorBy, jobInstance,
    } = props;

    enum MenuKeys {
        CREATE_URL = 'create_url',
        COPY = 'copy',
        PROPAGATE = 'propagate',
        SWITCH_ORIENTATION = 'switch_orientation',
        RESET_PERSPECIVE = 'reset_perspective',
        TO_BACKGROUND = 'to_background',
        TO_FOREGROUND = 'to_foreground',
        SWITCH_COLOR = 'switch_color',
        REMOVE_ITEM = 'remove_item',
        EDIT_MASK = 'edit_mask',
    }

    const is2D = jobInstance.dimension === DimensionType.DIMENSION_2D;

    return (
        <Menu className='cvat-object-item-menu' selectable={false}>
            {!readonly && objectType !== ObjectType.TAG && (
                <MakeCopyItem key={MenuKeys.COPY} toolProps={props} />
            )}
            {!readonly && <EditMaskItem key={MenuKeys.EDIT_MASK} toolProps={props} />}
            {!readonly && <PropagateItem key={MenuKeys.PROPAGATE} toolProps={props} />}
            {is2D && !readonly && [ShapeType.POLYGON, ShapeType.POLYLINE, ShapeType.CUBOID].includes(shapeType) && (
                <SwitchOrientationItem key={MenuKeys.SWITCH_ORIENTATION} toolProps={props} />
            )}
            {is2D && !readonly && shapeType === ShapeType.CUBOID && (
                <ResetPerspectiveItem key={MenuKeys.RESET_PERSPECIVE} toolProps={props} />
            )}
            {[ColorBy.INSTANCE, ColorBy.GROUP].includes(colorBy) && (
                <SwitchColorItem key={MenuKeys.SWITCH_COLOR} toolProps={props} />
            )}
            {!readonly && <RemoveItem key={MenuKeys.REMOVE_ITEM} toolProps={props} />}
        </Menu>
    );
}
