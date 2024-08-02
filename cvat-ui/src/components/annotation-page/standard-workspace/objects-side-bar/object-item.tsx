import React, { useCallback, useEffect, useState } from 'react';

import ObjectButtonsContainer from 'containers/annotation-page/standard-workspace/objects-side-bar/object-buttons';
import ItemDetailsContainer from 'containers/annotation-page/standard-workspace/objects-side-bar/object-item-details';
import { ObjectType, ShapeType, ColorBy } from 'reducers';
import { ObjectState } from 'cvat-core-wrapper';
import { Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import ObjectItemElementComponent from './object-item-element';
import ItemBasics from './object-item-basics';

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

function ObjectItemComponent(props: Props): JSX.Element {
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
        elements,
        attributes,
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

    const className = !activated ?
        '' :
        'cvat-objects-sidebar-state-active-item';

    const activateState = useCallback(() => {
        activate();
    }, []);

    const [hasMounted, setHasMounted] = useState(false);
    const [partCollapsed, setPartCollapsed] = useState(true);
    useEffect(() => {
        setHasMounted(true);
    }, []);

    return (
        <>
            <div
                style={{ display: 'flex' }}
                className={className}
            >
                <div className='cvat-objects-sidebar-state-item-color'>
                    <div style={{ background: color }}>
                        <div style={{ borderColor: color }}>
                            {' '}
                        </div>
                    </div>
                </div>
                <div
                    onMouseEnter={activateState}
                    id={`cvat-objects-sidebar-state-item-${clientID}`}
                    className='cvat-objects-sidebar-state-item'
                >
                    <ItemBasics
                        jobInstance={jobInstance}
                        readonly={readonly}
                        serverID={serverID}
                        clientID={clientID}
                        labelID={labelID}
                        labels={labels}
                        shapeType={shapeType}
                        objectType={objectType}
                        color={color}
                        colorBy={colorBy}
                        type={type}
                        locked={locked}
                        copyShortcut={normalizedKeyMap.COPY_SHAPE}
                        pasteShortcut={normalizedKeyMap.PASTE_SHAPE}
                        propagateShortcut={normalizedKeyMap.PROPAGATE_OBJECT}
                        toBackgroundShortcut={normalizedKeyMap.TO_BACKGROUND}
                        toForegroundShortcut={normalizedKeyMap.TO_FOREGROUND}
                        removeShortcut={normalizedKeyMap.DELETE_OBJECT}
                        changeColorShortcut={normalizedKeyMap.CHANGE_OBJECT_COLOR}
                        changeLabel={changeLabel}
                        changeColor={changeColor}
                        copy={copy}
                        remove={remove}
                        propagate={propagate}
                        createURL={createURL}
                        switchOrientation={switchOrientation}
                        toBackground={toBackground}
                        toForeground={toForeground}
                        resetCuboidPerspective={resetCuboidPerspective}
                        edit={edit}
                    />
                </div>
            </div>
            <div className={className}>
                {(objectType === ObjectType.TRACK || !!attributes.length || !!elements.length) && (
                    <div className='cvat-objects-sidebar-state-item-bottom'>
                        {objectType === ObjectType.TRACK && (
                            <ObjectButtonsContainer
                                readonly={readonly}
                                clientID={clientID}
                                isTrack
                                isContextMenu={false}
                            />
                        )}
                        {!!attributes.length && (
                            <ItemDetailsContainer
                                readonly={readonly}
                                clientID={clientID}
                                parentID={null}
                                hasMounted={hasMounted}
                            />
                        )}
                        {!!elements.length && (
                            <Button
                                type='text'
                                onClick={() => setPartCollapsed(!partCollapsed)}
                                icon={partCollapsed ? <DownOutlined /> : <UpOutlined />}
                                className='cvat-item-attributes-button'
                            >
                                PARTS
                            </Button>
                        )}
                    </div>
                )}
                <div className={
                    `cvat-objects-sidebar-state-item-details
                    cvat-objects-sidebar-state-item-details-${clientID}
                    ${className}`
                }
                >
                    {!partCollapsed && elements.map((element: ObjectState) => (
                        <ObjectItemElementComponent
                            key={element.clientID as number}
                            readonly={readonly}
                            parentID={clientID}
                            clientID={element.clientID as number}
                            onMouseLeave={activateState}
                        />
                    ))}
                </div>
            </div>
        </>

    );
}

export default React.memo(ObjectItemComponent);
