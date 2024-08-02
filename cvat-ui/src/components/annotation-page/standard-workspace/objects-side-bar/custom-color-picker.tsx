import React, { useEffect, useState } from 'react';

import { getCore } from 'cvat-core-wrapper';
import { Col, Row } from 'antd';
import { CustomPicker, HSLColor } from 'react-color';
import { Saturation, Hue, EditableInput } from 'react-color/lib/components/common';
import ReactCircleColorPicker from 'react-circle-color-picker';
import Text from 'antd/lib/typography/Text';

const core = getCore();

interface Props {
    color: string | undefined;
    setColorState: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const styles = {
    hue: {
        height: 10,
    },
    saturation: {
        width: '100%',
        height: 150,
    },
    input: {
        height: 34,
        width: '98%',
        paddingLeft: 10,
        background: '#1F1F20',
        borderRadius: 6,
        color: '#fff',
        border: 'none',
        outline: 'none',
    },
    rgb: {
        height: 34,
        width: '95%',
        background: '#1F1F20',
        borderRadius: 6,
        color: '#fff',
        border: 'none',
        outline: 'none',
        padding: 10,
    },
    swatch: {
        height: 15,
    },
};

const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        return { h: 0, s: 0, l: 0 };
    }

    const rHex = parseInt(result[1], 16);
    const gHex = parseInt(result[2], 16);
    const bHex = parseInt(result[3], 16);

    const r = rHex / 255;
    const g = gHex / 255;
    const b = bHex / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = (max + min) / 2;
    let s = h;
    let l = h;

    if (max === min) {
        // Achromatic
        return { h: 0, s: 0, l };
    }

    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
        case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
        case g:
            h = (b - r) / d + 2;
            break;
        case b:
            h = (r - g) / d + 4;
            break;
        default:
            break;
    }
    h /= 6;

    s *= 100;
    s = Math.round(s);
    l *= 100;
    l = Math.round(l);
    h = Math.round(360 * h);

    return { h, s, l };
};

const hexToHSV = (hex: string): { h: number, s: number, v: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result === null) {
        return { h: 0, s: 0, v: 0 };
    }
    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);
    r /= 255; g /= 255; b /= 255;

    const max = Math.max(r, g, b); const min = Math.min(r, g, b);
    let h = max; let s = max; const v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            default: break;
        }

        h /= 6;
    }
    return { h, s, v };
};

const HSLToHex = (h: number, s: number, l: number): string => {
    const hDecimal = h / 100;
    const sDecimal = s / 100;
    const lDecimal = l / 100;

    let r; let g; let b;

    if (s === 0) {
        return '#000000';
    }

    const HueToRGB = (p: number, q: number, t: number): number => {
        // eslint-disable-next-line no-param-reassign
        if (t < 0) t += 1;
        // eslint-disable-next-line no-param-reassign
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    const q = lDecimal < 0.5 ? lDecimal * (1 + sDecimal) : lDecimal + sDecimal - lDecimal * sDecimal;
    const p = 2 * lDecimal - q;

    r = HueToRGB(p, q, hDecimal + 1 / 3);
    g = HueToRGB(p, q, hDecimal);
    b = HueToRGB(p, q, hDecimal - 1 / 3);

    r *= 255;
    g *= 255;
    b *= 255;

    return `#${[r, g, b]
        .map((y) => y.toString(16).padStart(2, '0')).join('')}`;
};

const hexToRGB = (hex: string): { r: number, g: number, b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
};

const HSVToHex = (h: number, s: number, v: number): string => {
    let r = 0; let g = 0; let b = 0;

    const d = 0.0166666666666666 * h;

    let c = v * s;
    let x = c - c * Math.abs((d % 2.0) - 1.0);
    const m = v - c;
    c += m;
    x += m;
    // eslint-disable-next-line no-bitwise
    switch (d >>> 0) {
        case 0: r = c; g = x; b = m; break;
        case 1: r = x; g = c; b = m; break;
        case 2: r = m; g = c; b = x; break;
        case 3: r = m; g = x; b = c; break;
        case 4: r = x; g = m; b = c; break;
        default: break;
    }

    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);

    return `#${[r, g, b]
        .map((y) => y.toString(16).padStart(2, '0')).join('')}`;
};

const MyColorPicker = ({ color, setColorState }: Props): JSX.Element => {
    const colors = [...core.enums.colors];
    const colorMap = colors.map((c) => ({ hex: c, selected: c === color }));

    const [hsl, setHsl] = useState({ h: 0, s: 0, l: 0 });
    const [hsv, setHsv] = useState({ h: 0, s: 0, v: 0 });
    const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 });
    const [lastSelected, setLastSelected] = useState<any>(color);
    useEffect(() => {
        if (color) {
            const hsvColor = hexToHSV(color);
            const rgbColor = hexToRGB(color);
            setHsv(hsvColor);
            setRgb(rgbColor);
        }
    }, [color]);

    const handleSaturationChange = (hsvColor: { h: number, s: number, v: number }): void => {
        setHsv(hsvColor);
        const hex = HSVToHex(hsvColor.h, hsvColor.s, hsvColor.v);
        setColorState(hex);
    };

    const handleHueChange = (hslColor: HSLColor): void => {
        setHsl({ h: hslColor.h, s: hslColor.s, l: hslColor.l });
        setColorState(HSLToHex(hslColor.h, hslColor.s, hslColor.l));
    };

    const handleEditableChange = (hex: string): void => {
        setHsl(hexToHSL(hex));
        setColorState(hex);
    };

    return (
        <>
            <Row style={{ marginBottom: 15 }}>
                <Col span={12}>
                    <div style={{ ...styles.saturation, position: 'relative' }}>
                        <Saturation
                            hsl={hsl}
                            hsv={hsv}
                            color={color}
                            onChange={(c: any) => handleSaturationChange(c)}
                        />
                    </div>
                    <Row>
                        <Col span={20}>
                            <div style={{ ...styles.hue, position: 'relative' }}>
                                <Hue hsl={hsl} hsv={hsv} color={color} onChange={(c: any) => handleHueChange(c)} />

                            </div>
                        </Col>
                        <Col span={3} offset={1}>
                            <div style={{ ...styles.swatch, position: 'relative', background: color }} />
                        </Col>
                    </Row>
                </Col>
                <Col span={11} offset={1} style={{ width: '100%' }}>
                    <EditableInput
                        style={{ input: styles.input }}
                        value={color}
                        onChange={(c: any) => handleEditableChange(c)}
                    />
                    <Text>Hex</Text>
                    <Row style={{ marginTop: 15 }}>
                        <Col span={8}>
                            <EditableInput
                                style={{ input: styles.rgb }}
                                value={rgb.r}
                            />
                            <Text>R</Text>

                        </Col>
                        <Col span={8}>
                            <EditableInput
                                style={{ input: styles.rgb }}
                                value={rgb.g}
                            />
                            <Text>G</Text>

                        </Col>
                        <Col span={8}>
                            <EditableInput
                                style={{ input: styles.rgb }}
                                value={rgb.b}
                            />
                            <Text>B</Text>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row className='circle-picker'>
                <ReactCircleColorPicker
                    onChange={(e: any[]) => {
                        if (colorMap.find((c) => c.hex === color) === undefined) {
                            e.filter((c) => c.hex === lastSelected).map((c) => {
                                c.selected = false;
                                return c;
                            });
                        }
                        const selectedList = e.filter((c) => c.selected === true);
                        // selectedValue is same as previous canvasBackgroundColor
                        // when select the same color
                        let selectedValue = selectedList[0] ?
                            selectedList[0].hex : color;
                        // selectedList.length is 0 if all color.selected are false
                        // Get color.hex has canvasBackgroundColor
                        // and force to make it true then exit
                        if (selectedList.length === 0) {
                            // eslint-disable-next-line max-len
                            const isSame = e.filter((c) => c.hex === color)[0];
                            isSame.selected = true;
                            return;
                        }
                        // Change canvasBackgroundColor
                        // if current selected hex is different than previous canvasBackgroundColor
                        selectedList.forEach((item) => {
                            if (item.hex === color) {
                                item.selected = false;
                            } else selectedValue = item.hex;
                        });
                        setLastSelected(selectedValue);
                        setColorState(selectedValue);
                        setHsl(hexToHSL(selectedValue));
                    }}
                    width='100%'
                    colors={colorMap}
                />
            </Row>
        </>
    );
};
export default CustomPicker(MyColorPicker);
