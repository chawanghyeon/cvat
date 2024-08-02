import React, { useState } from 'react';
import { Modal } from 'antd';
import CustomColorPicker from './custom-color-picker';

interface Props {
    value?: string;
    visible?: boolean;
    resetVisible?: boolean;
    onChange?: (value: string) => void;
    onVisibleChange?: (visible: boolean) => void;
}

function ColorPicker(props: Props): JSX.Element {
    const {
        value, visible, onChange, onVisibleChange,
    } = props;

    const [colorState, setColorState] = useState(value);
    const [pickerVisible, setPickerVisible] = useState(false);
    const changeVisible = (_visible: boolean): void => {
        if (typeof onVisibleChange === 'function') {
            onVisibleChange(_visible);
        } else {
            setPickerVisible(_visible);
        }
    };

    return (
        <Modal
            title='Select color'
            className='cvat-label-color-picker'
            open={typeof visible === 'boolean' ? visible : pickerVisible}
            onOk={() => {
                if (typeof onChange === 'function') onChange(colorState || '');
                changeVisible(!visible);
            }}
            onCancel={() => changeVisible(!visible)}
        >
            <CustomColorPicker
                color={colorState}
                setColorState={setColorState}
            />
        </Modal>
    );
}

export default React.memo(ColorPicker);
