import './styles.scss';
import React from 'react';
import Layout from 'antd/lib/layout';

import CanvasLayout from 'components/annotation-page/canvas/grid-layout/canvas-layout';
import ControlsSideBarContainer from 'containers/annotation-page/standard-workspace/controls-side-bar/controls-side-bar';
import CanvasContextMenuContainer from 'containers/annotation-page/canvas/canvas-context-menu';
import ObjectsListContainer from 'containers/annotation-page/standard-workspace/objects-side-bar/objects-list';
import ObjectSideBarComponent from 'components/annotation-page/standard-workspace/objects-side-bar/objects-side-bar';
import CanvasPointContextMenuComponent from 'components/annotation-page/canvas/views/canvas2d/canvas-point-context-menu';
import IssueAggregatorComponent from 'components/annotation-page/review/issues-aggregator';
import RemoveConfirmComponent from 'components/annotation-page/standard-workspace/remove-confirm';
import ObjectsLeftSideBarComponent from 'components/annotation-page/standard-workspace/objects-side-bar/objects-left-side-bar';
import PropagateConfirmComponent from 'components/annotation-page/standard-workspace/propagate-confirm';

export default function StandardWorkspaceComponent(): JSX.Element {
    return (
        <>
            <Layout.Header className='cvat-annotation-header'>
                <ControlsSideBarContainer />
            </Layout.Header>
            <Layout.Content className='cvat-annotation-layout-content'>
                <Layout hasSider className='cvat-standard-workspace'>
                    <ObjectsLeftSideBarComponent objectsList={<ObjectsListContainer />} />
                    <CanvasLayout />
                    <ObjectSideBarComponent objectsList={<ObjectsListContainer />} />
                    <PropagateConfirmComponent />
                    <CanvasContextMenuContainer />
                    <CanvasPointContextMenuComponent />
                    <IssueAggregatorComponent />
                    <RemoveConfirmComponent />
                </Layout>
            </Layout.Content>
        </>
    );
}
