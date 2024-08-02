import './styles.scss';
import React, { Dispatch, TransitionEvent } from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import Layout from 'antd/lib/layout';

import { Canvas } from 'cvat-canvas-wrapper';
import { Canvas3d } from 'cvat-canvas3d-wrapper';
import { CombinedState } from 'reducers';
import { collapseLeftSidebar as collapseSidebarAction } from 'actions/annotation-actions';

interface OwnProps {
    objectsList: JSX.Element;
}

interface StateToProps {
    leftSidebarCollapsed: boolean;
    canvasInstance: Canvas | Canvas3d | null;
    jobInstance: any;
}

interface DispatchToProps {
    collapseSidebar(): void;
}

function mapStateToProps(state: CombinedState): StateToProps {
    const {
        annotation: {
            leftSidebarCollapsed,
            canvas: { instance: canvasInstance },
            job: { instance: jobInstance },
        },
    } = state;

    return {
        leftSidebarCollapsed,
        canvasInstance,
        jobInstance,
    };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>): DispatchToProps {
    return {
        collapseSidebar(): void {
            dispatch(collapseSidebarAction());
        },
    };
}

function ObjectsLeftSideBar(props: StateToProps & DispatchToProps & OwnProps): JSX.Element {
    const {
        leftSidebarCollapsed, canvasInstance, collapseSidebar, objectsList,
    } = props;

    const collapse = (): void => {
        const [collapser] = window.document.getElementsByClassName('cvat-objects-left-sidebar');
        const listener = (event: TransitionEvent): void => {
            if (canvasInstance == null) {
                return;
            }
            if (event.target && event.propertyName === 'width' && event.target === collapser) {
                canvasInstance.fitCanvas();
                canvasInstance.fit();
                (collapser as HTMLElement).removeEventListener('transitionend', listener as any);
            }
        };

        if (collapser) {
            (collapser as HTMLElement).addEventListener('transitionend', listener as any);
        }

        collapseSidebar();
    };

    return (
        <Layout.Sider
            className='cvat-objects-left-sidebar'
            theme='light'
            width={292}
            collapsedWidth={40}
            reverseArrow={false}
            collapsible
            trigger={null}
            collapsed={leftSidebarCollapsed}
        >

            {/* eslint-disable-next-line */}
            <span
                className={`cvat-objects-left-sidebar-sider
                    ant-layout-sider-zero-width-trigger
                    ant-layout-sider-zero-width-trigger-left`}
                onClick={collapse}
            >
                {leftSidebarCollapsed ? <div className='color-icon'><MenuUnfoldOutlined title='Show' /></div> : <MenuFoldOutlined title='Hide' />}
            </span>
            <div className='cvat-objects-sidebar-objects-list-header'>
                <span className='header-title'>
                    {!leftSidebarCollapsed && 'Objects'}
                </span>
            </div>
            {objectsList}
        </Layout.Sider>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(ObjectsLeftSideBar));
