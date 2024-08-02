import React from 'react';
import ObjectItemContainer from 'containers/annotation-page/standard-workspace/objects-side-bar/object-item';

interface Props {
    readonly: boolean;
    sortedStatesID: number[];
    objectStates: any[];
    leftSidebarCollapsed: boolean;
}

function ObjectListComponent(props: Props): JSX.Element {
    const {
        readonly, sortedStatesID, objectStates, leftSidebarCollapsed,
    } = props;

    return (
        <>
            <div className='cvat-objects-sidebar-states-list'>
                {!leftSidebarCollapsed && sortedStatesID.map(
                    (id: number): JSX.Element => (
                        <ObjectItemContainer
                            readonly={readonly}
                            objectStates={objectStates}
                            key={id}
                            clientID={id}
                        />
                    ),
                )}
            </div>
        </>
    );
}

export default ObjectListComponent;
