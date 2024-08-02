import React from 'react';
import { Row } from 'antd/lib/grid';

import { Button } from 'antd';
import ReactDOM from 'react-dom';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import ItemAttribute from './object-item-attribute';

interface Props {
    hasMounted: boolean;
    clientID: number;
    readonly: boolean;
    collapsed: boolean;
    attributes: any[];
    values: Record<number, string>;
    changeAttribute(attrID: number, value: string): void;
    collapse(): void;
}

export function attrValuesAreEqual(next: Record<number, string>, prev: Record<number, string>): boolean {
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);

    return (
        nextKeys.length === prevKeys.length &&
        nextKeys.map((key: string): boolean => prev[+key] === next[+key]).every((value: boolean) => value)
    );
}

function attrAreTheSame(prevProps: Props, nextProps: Props): boolean {
    return (
        nextProps.readonly === prevProps.readonly &&
        nextProps.collapsed === prevProps.collapsed &&
        nextProps.attributes === prevProps.attributes &&
        attrValuesAreEqual(nextProps.values, prevProps.values)
    );
}

function ItemAttributesDetailComponent(props: Props): JSX.Element | null {
    const {
        clientID, hasMounted, attributes, values, readonly, changeAttribute,
    } = props;

    const isExist =
        document.getElementsByClassName(`cvat-objects-sidebar-state-item-details-${clientID}`)[0] !== undefined;

    return isExist ? ReactDOM.createPortal(
        <>
            {hasMounted && attributes.map(
                (attribute: any): JSX.Element => (
                    <Row
                        key={attribute.id}
                        align='middle'
                        justify='center'
                        className='cvat-object-item-attribute-wrapper'
                    >
                        <ItemAttribute
                            readonly={readonly}
                            attrValue={values[attribute.id]}
                            attrInputType={attribute.inputType}
                            attrName={attribute.name}
                            attrID={attribute.id}
                            attrValues={attribute.values}
                            changeAttribute={changeAttribute}
                        />
                    </Row>
                ),
            )}
        </>,
        document.getElementsByClassName(`cvat-objects-sidebar-state-item-details-${clientID}`)[0],
    ) : <div />;
}

function ItemAttributesComponent(props: Props): JSX.Element {
    const {
        hasMounted, clientID, collapsed, attributes, values, readonly, changeAttribute, collapse,
    } = props;

    return (
        <Row>
            <Button
                type='text'
                onClick={collapse}
                icon={collapsed ? <DownOutlined /> : <UpOutlined />}
                className='cvat-item-attributes-button'
            >
                DETAILS
            </Button>
            { !collapsed && (
                <ItemAttributesDetailComponent
                    hasMounted={hasMounted}
                    clientID={clientID}
                    collapsed={collapsed}
                    attributes={attributes}
                    values={values}
                    readonly={readonly}
                    changeAttribute={changeAttribute}
                    collapse={collapse}
                />
            )}
        </Row>
    );
}

export default React.memo(ItemAttributesComponent, attrAreTheSame);
