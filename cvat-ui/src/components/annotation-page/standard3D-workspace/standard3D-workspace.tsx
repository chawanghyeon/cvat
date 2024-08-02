import React from 'react';
import Layout from 'antd/lib/layout';

import { DimensionType } from 'cvat-core-wrapper';
import ControlsSideBarContainer from 'containers/annotation-page/standard3D-workspace/controls-side-bar/controls-side-bar';
import ObjectSideBarComponent from 'components/annotation-page/standard-workspace/objects-side-bar/objects-side-bar';
import ObjectsListContainer from 'containers/annotation-page/standard-workspace/objects-side-bar/objects-list';
import ObjectsLeftSideBarComponent from 'components/annotation-page/standard-workspace/objects-side-bar/objects-left-side-bar';
import CanvasContextMenuContainer from 'containers/annotation-page/canvas/canvas-context-menu';
import CanvasLayout from 'components/annotation-page/canvas/grid-layout/canvas-layout';
import CanvasPointContextMenuComponent from 'components/annotation-page/canvas/views/canvas2d/canvas-point-context-menu';
import RemoveConfirmComponent from 'components/annotation-page/standard-workspace/remove-confirm';
import PropagateConfirmComponent from 'components/annotation-page/standard-workspace/propagate-confirm';

export default function StandardWorkspace3DComponent(): JSX.Element {
    return (
        <>
            <Layout.Header className='cvat-annotation-header'>
                <ControlsSideBarContainer />
            </Layout.Header>
            <Layout.Content className='cvat-annotation-layout-content'>
                <Layout hasSider className='cvat-standard-workspace'>
                    <ObjectsLeftSideBarComponent objectsList={<ObjectsListContainer />} />
                    <CanvasLayout type={DimensionType.DIMENSION_3D} />
                    <ObjectSideBarComponent objectsList={<ObjectsListContainer />} />
                    <PropagateConfirmComponent />
                    <CanvasContextMenuContainer />
                    <CanvasPointContextMenuComponent />
                    <RemoveConfirmComponent />
                </Layout>
            </Layout.Content>
        </>
    );
}