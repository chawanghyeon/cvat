import './styles.scss';
import React from 'react';

import DeployedModelsList from './deployed-models-list';
import EmptyListComponent from './empty-list';
// import FeedbackComponent from '../feedback/feedback';
import { MLModel } from 'cvat-core-wrapper';

interface Props {
    interactors: MLModel[];
    detectors: MLModel[];
    trackers: MLModel[];
    reid: MLModel[];
}

export default function ModelsPageComponent(props: Props): JSX.Element {
    const {
        interactors, detectors, trackers, reid,
    } = props;

    const deployedModels = [
        ...(detectors || []),
        ...(interactors || []),
        ...(trackers || []),
        ...(reid || []),
      ];

    return (
        <div className='cvat-models-page'>
            {deployedModels.length ? <DeployedModelsList models={deployedModels} /> : <EmptyListComponent />}
        </div>
    );
}
