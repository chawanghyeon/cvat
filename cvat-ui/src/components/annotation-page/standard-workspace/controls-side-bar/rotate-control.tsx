import React from 'react';
import Icon from '@ant-design/icons';
import Popover from 'antd/lib/popover';

import { RotateIcon } from 'icons';
import { Rotation } from 'reducers';
import CVATTooltip from 'components/common/cvat-tooltip';
import withVisibilityHandling from './handle-popover-visibility';

export interface Props {
    clockwiseShortcut: string;
    anticlockwiseShortcut: string;
    rotateFrame(rotation: Rotation): void;
}

const CustomPopover = withVisibilityHandling(Popover, 'rotate-canvas');
function RotateControl(props: Props): JSX.Element {
    const { anticlockwiseShortcut, clockwiseShortcut, rotateFrame } = props;

    return (
        <CustomPopover
            placement='bottom'
            content={(
                <>
                    <CVATTooltip title={`반시계방향으로 회전 ${anticlockwiseShortcut}`} placement='bottomRight'>
                        <Icon
                            className='cvat-rotate-canvas-controls-left'
                            onClick={(): void => rotateFrame(Rotation.ANTICLOCKWISE90)}
                            component={RotateIcon}
                        />
                    </CVATTooltip>
                    <CVATTooltip title={`시계방향으로 회전 ${clockwiseShortcut}`} placement='bottomRight'>
                        <Icon
                            className='cvat-rotate-canvas-controls-right'
                            onClick={(): void => rotateFrame(Rotation.CLOCKWISE90)}
                            component={RotateIcon}
                        />
                    </CVATTooltip>
                </>
            )}
            trigger='hover'
            arrowPointAtCenter
        >
            <Icon className='cvat-rotate-canvas-control' component={RotateIcon} />
        </CustomPopover>
    );
}

export default React.memo(RotateControl);
