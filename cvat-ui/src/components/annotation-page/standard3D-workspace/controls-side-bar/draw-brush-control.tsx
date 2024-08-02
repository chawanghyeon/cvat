import React, { useCallback, useEffect, useState } from 'react';
import Icon, {
    MinusCircleOutlined, PlusCircleOutlined, AimOutlined, BgColorsOutlined,
} from '@ant-design/icons';
import { Canvas } from 'cvat-canvas-wrapper';
import { Canvas3d } from 'cvat-canvas3d-wrapper';
import { BrushIcon } from 'icons';
import { Row, Slider } from 'antd';
import CVATTooltip from 'components/common/cvat-tooltip';
import { useSelector } from 'react-redux';
import { CombinedState } from 'reducers';

export interface Props {
    canvasInstance: Canvas | Canvas3d;
    disabled?: boolean;
}

function DrawBrushControl(props: Props): JSX.Element {
    const { canvasInstance, disabled } = props;
    const [onBrush, setOnBrush] = useState<boolean>(false);
    const [onAim, setOnAim] = useState<boolean>(false);
    const [onColor, setOnColor] = useState<boolean>(false);
    const [brushValue, setbrushValue] = useState<number>(2.5);
    const [PointValue, setPointValue] = useState<number>(0.05);
    const { activatedStateID } = useSelector((state:CombinedState) => state.annotation.annotations);

    const handleCanvas3D = (size: number, pointSize: number):void => {
        if (canvasInstance instanceof Canvas3d) {
            canvasInstance.brush({
                enabled: false, brush: true, size, pointSize,
            });
        }
    };

    const handleBrushSize = (value: number):void => {
        const [container]:any = window.document.getElementsByClassName('round-circle');
        container.style.width = `${(value + 1) * 10}px`;
        container.style.height = `${(value + 1) * 10}px`;
    };

    const handleBrushSlider = (value: number):void => {
        setbrushValue(value);
        handleBrushSize(value);
        handleCanvas3D(value, PointValue);
    };

    const handleBrushMinus = ():void => {
        if (brushValue - 0.1 < 1) return;
        const value = Number((brushValue - 0.1).toFixed(1));
        handleBrushSlider(value);
    };

    const handleBrushPlus = ():void => {
        if (brushValue + 0.1 > 5) return;
        const value = Number((brushValue + 0.1).toFixed(1));
        handleBrushSlider(value);
    };

    const handlePointSlider = (value: number):void => {
        setPointValue(value);
        handleCanvas3D(brushValue, value);
    };

    const handlePointMinus = ():void => {
        if (PointValue - 0.01 < 0.01) return;
        const value = Number((PointValue - 0.01).toFixed(2));
        handlePointSlider(value);
    };

    const handlePointPlus = ():void => {
        if (PointValue + 0.01 > 0.15) return;
        const value = Number((PointValue + 0.01).toFixed(2));
        handlePointSlider(value);
    };

    const handleClr = ():void => {
        setOnColor(!onColor);
    };

    const handleEscOrClick = useCallback(():void => {
        if (canvasInstance instanceof Canvas3d) {
            canvasInstance.brush({
                enabled: false, brush: false, size: 2.5, pointSize: 0.05,
            });
            canvasInstance.fixedObject(0);
            setOnBrush(false);
            setOnAim(false);
            setPointValue(0.05);
            setbrushValue(2.5);
            handleBrushSize(2.5);
            const [container]:any = window.document.getElementsByClassName('round-circle');
            const [brush]:any = window.document.getElementsByClassName('brush-slider');
            container.style.display = 'none';
            brush.style.display = 'none';
        }
    }, []);

    const dynamicBrush = onBrush ? {
        className: 'cvat-brush-control cvat-active-canvas-control',
        onClick: handleEscOrClick,
    } : {
        className: 'cvat-brush-control',
        onClick: (): void => {
            if (canvasInstance instanceof Canvas3d) {
                canvasInstance.brush({
                    enabled: false, brush: true, size: 2.5, pointSize: 0.05,
                });
                setOnBrush(true);
                const [container]:any = window.document.getElementsByClassName('round-circle');
                const [brush]:any = window.document.getElementsByClassName('brush-slider');
                container.style.display = 'block';
                brush.style.display = 'flex';
            }
        },
    };

    const dynamicAim = onAim ? {
        className: 'cvat-brush-Aim cvat-active-canvas-control',
        onClick: (): void => {
            if (canvasInstance instanceof Canvas3d) {
                canvasInstance.fixedObject(0);
                setOnAim(false);
            }
        },
    } : {
        className: 'cvat-brush-Aim',
        onClick: (): void => {
            if (activatedStateID !== null) {
                if (canvasInstance instanceof Canvas3d) {
                    canvasInstance.fixedObject(activatedStateID);
                    setOnAim(true);
                }
            }
        },
    };

    const dynamicClr = onColor ? {
        className: 'cvat-brush-color cvat-active-canvas-control',
    } : {
        className: 'cvat-brush-color',
    };

    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent): void => {
            if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                handleEscOrClick();
            }
        };

        const handleDoubleClick = (e:any): void => {
            if (e.target?.offsetParent?.id === 'cvat-canvas3d-perspective') {
                handleEscOrClick();
            }
        };

        window.addEventListener('keydown', handleEscapeKey);
        window.addEventListener('dblclick', handleDoubleClick);

        return () => {
            window.removeEventListener('keydown', handleEscapeKey);
            window.removeEventListener('dblclick', handleDoubleClick);
        };
    }, []);

    return disabled ? (
        <Icon className='cvat-brush-control' component={BrushIcon} style={{ marginBottom: 5 }} />
    ) : (
        <>
            <Row align='middle' style={{ marginBottom: onBrush ? 12 : 3 }}>
                <CVATTooltip title='Press ctrl key and move to draw or press alt key and move to Erase and double click to save' placement='bottom'>
                    <Icon
                        {...dynamicBrush}
                        component={BrushIcon}
                    />
                </CVATTooltip>

                <Row align='middle' justify='space-between' className='brush-slider' style={{ display: 'none' }}>
                    <CVATTooltip title='The active object does not change' placement='bottom'>
                        <AimOutlined {...dynamicAim} />
                    </CVATTooltip>

                    <CVATTooltip title='Only objects' placement='bottom' className='PCD-paint'>
                        <BgColorsOutlined
                            {...dynamicClr}
                            onClick={handleClr}
                        />
                    </CVATTooltip>

                    <span style={{ color: 'white' }}>Brush Size : </span>
                    <CVATTooltip title='Brush Size' placement='bottom'>
                        <MinusCircleOutlined style={{ fontSize: 20, marginLeft: 5 }} onClick={handleBrushMinus} />
                    </CVATTooltip>
                    <Slider
                        min={1}
                        max={5}
                        step={0.1}
                        onChange={handleBrushSlider}
                        value={brushValue}
                        tooltip={{ placement: 'bottom' }}
                        style={{ marginLeft: 6, width: 70 }}
                    />
                    <CVATTooltip title='Brush Size' placement='bottom'>
                        <PlusCircleOutlined style={{ fontSize: 20, marginRight: 15 }} onClick={handleBrushPlus} />
                    </CVATTooltip>

                    <span style={{ color: 'white' }}>Point Size : </span>
                    <CVATTooltip title='Point Size' placement='bottom'>
                        <MinusCircleOutlined style={{ fontSize: 20, marginLeft: 5 }} onClick={handlePointMinus} />
                    </CVATTooltip>
                    <Slider
                        min={0.01}
                        max={0.15}
                        step={0.01}
                        onChange={handlePointSlider}
                        value={PointValue}
                        tooltip={{ placement: 'bottom' }}
                        style={{ marginLeft: 6, width: 70 }}
                    />
                    <CVATTooltip title='Point Size' placement='bottom'>
                        <PlusCircleOutlined style={{ fontSize: 20, marginRight: 5 }} onClick={handlePointPlus} />
                    </CVATTooltip>
                </Row>
            </Row>

            <div
                className='round-circle'
                style={{
                    width: 35,
                    height: 35,
                    border: '2px solid #fff',
                    borderRadius: '50%',
                    backgroundColor: 'transparent',
                    display: 'none',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'scale(0.3)',
                    zIndex: 9999,
                }}
            />
        </>
    );
}

export default DrawBrushControl;
